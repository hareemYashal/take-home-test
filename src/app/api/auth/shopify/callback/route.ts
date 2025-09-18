import { NextRequest, NextResponse } from 'next/server'
import { processOAuthCallback } from '@/lib/actions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const state = searchParams.get('state')

  if (!code || !shop) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url))
  }

  // Use Server Action to process OAuth callback
  const result = await processOAuthCallback(code, shop, state || '')

  if (result.error) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url))
  }

  // Redirect to success page with shop ID
  return NextResponse.redirect(new URL(`/?connected=${result.shopId}`, request.url))
}
