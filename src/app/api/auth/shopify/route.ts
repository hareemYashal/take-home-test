import { NextRequest, NextResponse } from 'next/server'
import { generateShopifyOAuthUrl } from '@/lib/shopify'
import { safeLog, safeError } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopDomain } = body

    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Shop domain is required' },
        { status: 400 }
      )
    }

    // Clean up shop domain (remove protocol and trailing slashes)
    const cleanShopDomain = shopDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace('.myshopify.com', '') + '.myshopify.com'

    safeLog('Initiating Shopify OAuth', { shopDomain: cleanShopDomain })

    const oauthUrl = generateShopifyOAuthUrl(cleanShopDomain)
    
    return NextResponse.json({ oauthUrl })
    
  } catch (error) {
    safeError('OAuth initiation error', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}
