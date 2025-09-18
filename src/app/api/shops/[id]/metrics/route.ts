import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopifyClient } from '@/lib/shopify'
import { getLast30DaysRange } from '@/lib/date-utils'
import { safeLog, safeError } from '@/lib/security'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const shopId = resolvedParams.id

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      )
    }

    safeLog('Fetching metrics for shop', { shopId })

    // Find the shop in our database
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Get date range for last 30 days (Dubai timezone)
    const { fromDate, toDate } = getLast30DaysRange()

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

      safeLog('Successfully fetched metrics', { 
        shopId, 
        ordersCount: metrics.ordersCount,
        grossRevenue: metrics.grossRevenue 
      })

      return NextResponse.json(metrics)

    } catch (shopifyError) {
      safeError('Failed to fetch data from Shopify', shopifyError)
      console.error('Detailed Shopify Error:', {
        message: shopifyError instanceof Error ? shopifyError.message : 'Unknown error',
        stack: shopifyError instanceof Error ? shopifyError.stack : undefined,
        error: shopifyError
      })
      
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

      return NextResponse.json(zeroMetrics)
    }

  } catch (error) {
    safeError('Metrics API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
