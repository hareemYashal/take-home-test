import { ShopifyClient } from '../shopify'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock security functions to avoid console noise
jest.mock('../security', () => ({
  safeLog: jest.fn(),
  safeError: jest.fn()
}))

describe('ShopifyClient', () => {
  let client: ShopifyClient
  const mockShopDomain = 'test-shop.myshopify.com'
  const mockAccessToken = 'test-access-token'

  beforeEach(() => {
    client = new ShopifyClient(mockShopDomain, mockAccessToken)
    jest.clearAllMocks()
  })

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly with mocked order data', async () => {
      // Mock orders response
      const mockOrders = [
        {
          id: 1,
          total_price: '100.00',
          currency: 'USD',
          created_at: '2024-09-01T10:00:00Z'
        },
        {
          id: 2,
          total_price: '150.00',
          currency: 'USD',
          created_at: '2024-09-02T10:00:00Z'
        }
      ]

      // Mock the orders API call
      mockedAxios.get.mockResolvedValueOnce({
        data: { orders: mockOrders }
      })

      // Mock refunds API calls - first order has no refunds
      mockedAxios.get.mockResolvedValueOnce({
        data: { refunds: [] }
      })

      // Mock refunds API calls - second order has refunds
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          refunds: [
            {
              amount: '25.00',
              created_at: '2024-09-02T10:00:00Z'
            }
          ]
        }
      })

      const metrics = await client.calculateMetrics(
        'test-shop-id',
        '2024-08-19T00:00:00Z',
        '2024-09-18T23:59:59Z'
      )

      expect(metrics).toEqual({
        shopId: 'test-shop-id',
        fromDate: '2024-08-19T00:00:00Z',
        toDate: '2024-09-18T23:59:59Z',
        ordersCount: 2,
        grossRevenue: 250.00,
        currency: 'USD',
        avgOrderValue: 125.00,
        refundedAmount: 25.00,
        netRevenue: 225.00
      })

      // Verify API calls
      expect(mockedAxios.get).toHaveBeenCalledTimes(3) // 1 orders call + 2 refunds calls
      
      // Verify orders API call
      expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 
        'https://test-shop.myshopify.com/admin/api/2023-10/orders.json',
        {
          headers: {
            'X-Shopify-Access-Token': 'test-access-token',
            'Content-Type': 'application/json'
          },
          params: {
            created_at_min: '2024-08-19T00:00:00Z',
            created_at_max: '2024-09-18T23:59:59Z',
            status: 'any',
            limit: 250
          }
        }
      )
    })

    it('should return zero metrics when no orders exist', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { orders: [] }
      })

      const metrics = await client.calculateMetrics(
        'test-shop-id',
        '2024-08-19T00:00:00Z',
        '2024-09-18T23:59:59Z'
      )

      expect(metrics).toEqual({
        shopId: 'test-shop-id',
        fromDate: '2024-08-19T00:00:00Z',
        toDate: '2024-09-18T23:59:59Z',
        ordersCount: 0,
        grossRevenue: 0,
        currency: 'USD',
        avgOrderValue: 0,
        refundedAmount: 0,
        netRevenue: 0
      })
    })

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Shopify API Error'))

      await expect(
        client.calculateMetrics(
          'test-shop-id',
          '2024-08-19T00:00:00Z',
          '2024-09-18T23:59:59Z'
        )
      ).rejects.toThrow('Failed to fetch orders from Shopify API')
    })

    it('should handle refund API failures gracefully', async () => {
      // Mock successful orders call
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          orders: [
            {
              id: 1,
              total_price: '100.00',
              currency: 'USD',
              created_at: '2024-09-01T10:00:00Z'
            }
          ]
        }
      })

      // Mock failed refunds call
      mockedAxios.get.mockRejectedValueOnce(new Error('Refunds API Error'))

      const metrics = await client.calculateMetrics(
        'test-shop-id',
        '2024-08-19T00:00:00Z',
        '2024-09-18T23:59:59Z'
      )

      // Should still calculate metrics with zero refunds
      expect(metrics).toEqual({
        shopId: 'test-shop-id',
        fromDate: '2024-08-19T00:00:00Z',
        toDate: '2024-09-18T23:59:59Z',
        ordersCount: 1,
        grossRevenue: 100.00,
        currency: 'USD',
        avgOrderValue: 100.00,
        refundedAmount: 0,
        netRevenue: 100.00
      })
    })
  })
})
