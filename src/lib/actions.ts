'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateShopifyOAuthUrl, exchangeCodeForToken, ShopifyClient } from '@/lib/shopify'
import { getLast30DaysRange } from '@/lib/date-utils'
import { safeLog, safeError } from '@/lib/security'

// Server Action for initiating Shopify OAuth
export async function initiateShopifyOAuth(formData: FormData) {
  const shopDomain = formData.get('shopDomain') as string

  if (!shopDomain?.trim()) {
    return {
      error: 'Please enter your shop domain'
    }
  }

  // Clean up shop domain
  const cleanShopDomain = shopDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace('.myshopify.com', '') + '.myshopify.com'

  safeLog('Initiating Shopify OAuth via Server Action', { shopDomain: cleanShopDomain })

  const oauthUrl = generateShopifyOAuthUrl(cleanShopDomain)
  
  // Redirect to Shopify OAuth (this will throw NEXT_REDIRECT which is expected)
  redirect(oauthUrl)
}

// Server Action for processing OAuth callback
export async function processOAuthCallback(code: string, shop: string, state: string) {
  try {
    safeLog('Processing OAuth callback via Server Action', { shop, state })

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(shop, code)
    
    // Store shop data in database
    const shopRecord = await prisma.shop.upsert({
      where: { shopDomain: shop },
      update: {
        accessToken: tokenData.access_token,
        apiScope: tokenData.scope,
        updatedAt: new Date()
      },
      create: {
        shopDomain: shop,
        accessToken: tokenData.access_token,
        apiScope: tokenData.scope
      }
    })

    // Log successful OAuth
    await prisma.auditLog.create({
      data: {
        actor: 'server',
        action: 'oauth_success',
        shopId: shopRecord.id,
        meta: { shop, scope: tokenData.scope }
      }
    })

    safeLog('Successfully connected shop via Server Action', { shopId: shopRecord.id, shop })

    return {
      success: true,
      shopId: shopRecord.id
    }
  } catch (error) {
    safeError('OAuth callback error in Server Action', error)
    
    // Log failed OAuth attempt
    await prisma.auditLog.create({
      data: {
        actor: 'server',
        action: 'oauth_failure',
        meta: { error: 'Token exchange failed', shop }
      }
    })
    
    return {
      error: 'Failed to complete OAuth connection'
    }
  }
}

// Server Action for fetching metrics
export async function fetchShopMetrics(shopId: string) {
  try {
    safeLog('Fetching metrics via Server Action', { shopId })

    // Find the shop in our database
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return {
        error: 'Shop not found'
      }
    }

    // Get date range for last 30 days (Dubai timezone)
    const { fromDate, toDate } = getLast30DaysRange()
    safeLog('Date range for metrics', { fromDate, toDate, systemDate: new Date().toISOString() })

    try {
      // Create Shopify client and fetch metrics
      const shopifyClient = new ShopifyClient(shop.shopDomain, shop.accessToken)
      const metrics = await shopifyClient.calculateMetrics(shopId, fromDate, toDate)

      // Log metrics fetch
      await prisma.auditLog.create({
        data: {
          actor: 'server',
          action: 'metrics_fetch',
          shopId: shop.id,
          meta: { fromDate, toDate, ordersCount: metrics.ordersCount }
        }
      })

      safeLog('Successfully fetched metrics via Server Action', { 
        shopId, 
        ordersCount: metrics.ordersCount,
        grossRevenue: metrics.grossRevenue 
      })

      return {
        success: true,
        metrics
      }

    } catch (shopifyError) {
      safeError('Failed to fetch data from Shopify via Server Action', shopifyError)
      
      // Log error details safely without causing stack overflow
      if (shopifyError instanceof Error) {
        console.error('Shopify API Error Details:', {
          name: shopifyError.name,
          message: shopifyError.message,
          stack: shopifyError.stack?.substring(0, 500) + '...'
        })
      } else {
        console.error('Unknown Shopify Error:', String(shopifyError))
      }
      
      // Return zero metrics if Shopify API fails
      const zeroMetrics = {
        shopId,
        fromDate,
        toDate,
        ordersCount: 0,
        grossRevenue: 0,
        currency: 'CAD',
        avgOrderValue: 0,
        refundedAmount: 0,
        netRevenue: 0
      }

      return {
        success: true,
        metrics: zeroMetrics
      }
    }

  } catch (error) {
    safeError('Metrics fetch error in Server Action', error)
    return {
      error: 'Failed to fetch metrics'
    }
  }
}

// Server Action for disconnecting a shop
export async function disconnectShop(shopId: string) {
  try {
    safeLog('Disconnecting shop via Server Action', { shopId })

    // Log the disconnection
    await prisma.auditLog.create({
      data: {
        actor: 'server',
        action: 'shop_disconnect',
        shopId,
        meta: { timestamp: new Date().toISOString() }
      }
    })

    // Note: We don't delete the shop record for audit purposes
    // In production, you might want to revoke the access token via Shopify API
    
    return {
      success: true
    }
  } catch (error) {
    safeError('Shop disconnect error in Server Action', error)
    return {
      error: 'Failed to disconnect shop'
    }
  }
}
