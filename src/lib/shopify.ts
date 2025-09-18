import axios from 'axios'
import { safeLog, safeError } from './security'

export interface ShopifyOrder {
  id: string
  created_at: string
  total_price: string
  currency: string
  financial_status: string
  refunds?: ShopifyRefund[]
}

export interface ShopifyRefund {
  id: string
  created_at: string
  total_refunded_set: {
    shop_money: {
      amount: string
      currency_code: string
    }
  }
}

export interface ShopifyMetrics {
  shopId: string
  fromDate: string
  toDate: string
  ordersCount: number
  grossRevenue: number
  currency: string
  avgOrderValue: number
  refundedAmount: number
  netRevenue: number
}

export class ShopifyClient {
  private shopDomain: string
  private accessToken: string

  constructor(shopDomain: string, accessToken: string) {
    this.shopDomain = shopDomain
    this.accessToken = accessToken
  }

  private getApiUrl(endpoint: string): string {
    return `https://${this.shopDomain}/admin/api/2023-10/graphql.json`
  }

  private getRestApiUrl(endpoint: string): string {
    return `https://${this.shopDomain}/admin/api/2023-10/${endpoint}`
  }

  async getOrdersForDateRange(fromDate: string, toDate: string): Promise<ShopifyOrder[]> {
    try {
      const url = this.getRestApiUrl('orders.json')
      const params = {
        created_at_min: fromDate,
        created_at_max: toDate,
        status: 'any',
        limit: 250
      }

      safeLog('Fetching orders from Shopify', { url, params })

      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        },
        params
      })

      const orders = response.data.orders || []
      
      // Fetch refunds for each order
      const ordersWithRefunds = await Promise.all(
        orders.map(async (order: ShopifyOrder) => {
          try {
            const refundsResponse = await axios.get(
              this.getRestApiUrl(`orders/${order.id}/refunds.json`),
              {
                headers: {
                  'X-Shopify-Access-Token': this.accessToken,
                  'Content-Type': 'application/json'
                }
              }
            )
            return {
              ...order,
              refunds: refundsResponse.data.refunds || []
            }
          } catch (error) {
            safeError(`Failed to fetch refunds for order ${order.id}`, error)
            return { ...order, refunds: [] }
          }
        })
      )

      return ordersWithRefunds
    } catch (error) {
      safeError('Failed to fetch orders from Shopify', error)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        safeError('Shopify API Error Details', { status, data })
        throw new Error(`Shopify API Error: ${status} - ${JSON.stringify(data)}`)
      }
      throw new Error('Failed to fetch orders from Shopify API')
    }
  }

  async calculateMetrics(shopId: string, fromDate: string, toDate: string): Promise<ShopifyMetrics> {
    const orders = await this.getOrdersForDateRange(fromDate, toDate)
    
    let grossRevenue = 0
    let refundedAmount = 0
    let currency = 'CAD'
    
    orders.forEach(order => {
      const orderTotal = parseFloat(order.total_price) || 0
      grossRevenue += orderTotal
      
      if (order.currency) {
        currency = order.currency
      }
      
      // Calculate refunded amount
      if (order.refunds && order.refunds.length > 0) {
        order.refunds.forEach(refund => {
          const refundAmount = parseFloat(refund.total_refunded_set?.shop_money?.amount) || 0
          refundedAmount += refundAmount
        })
      }
    })
    
    const ordersCount = orders.length
    const avgOrderValue = ordersCount > 0 ? grossRevenue / ordersCount : 0
    const netRevenue = grossRevenue - refundedAmount
    
    return {
      shopId,
      fromDate,
      toDate,
      ordersCount,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      currency,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100
    }
  }
}

export function generateShopifyOAuthUrl(shopDomain: string): string {
  const clientId = process.env.SHOPIFY_APP_KEY
  const scopes = process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_customers'
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}/api/auth/shopify/callback`
  
  const params = new URLSearchParams({
    client_id: clientId!,
    scope: scopes,
    redirect_uri: redirectUri,
    state: Math.random().toString(36).substring(7)
  })
  
  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(shopDomain: string, code: string): Promise<{
  access_token: string
  scope: string
}> {
  try {
    const response = await axios.post(`https://${shopDomain}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_APP_KEY,
      client_secret: process.env.SHOPIFY_APP_SECRET,
      code
    })
    
    return response.data
  } catch (error) {
    safeError('Failed to exchange code for token', error)
    throw new Error('Failed to exchange authorization code for access token')
  }
}
