/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

// Define mocks first
const mockPrisma = {
  shop: {
    findUnique: jest.fn()
  },
  auditLog: {
    create: jest.fn()
  }
}

const mockShopifyClient = {
  calculateMetrics: jest.fn()
}

const mockGetLast30DaysRange = jest.fn().mockReturnValue({
  fromDate: '2024-08-19T00:00:00.000Z',
  toDate: '2024-09-18T23:59:59.999Z'
})

const mockSafeLog = jest.fn()
const mockSafeError = jest.fn()

// Mock modules
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

jest.mock('@/lib/shopify', () => ({
  ShopifyClient: jest.fn().mockImplementation(() => mockShopifyClient)
}))

jest.mock('@/lib/date-utils', () => ({
  getLast30DaysRange: mockGetLast30DaysRange
}))

jest.mock('@/lib/security', () => ({
  safeLog: mockSafeLog,
  safeError: mockSafeError
}))

// Import after mocking
import { GET } from '../[id]/metrics/route'

describe('/api/shops/[id]/metrics', () => {
  const mockShopId = 'test-shop-id-123'
  const mockShop = {
    id: mockShopId,
    shopDomain: 'test-shop.myshopify.com',
    accessToken: 'test-access-token',
    apiScope: 'read_orders,read_products',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metrics with correct shape and types', async () => {
    // Setup mocks
    mockPrisma.shop.findUnique.mockResolvedValueOnce(mockShop)
    mockPrisma.auditLog.create.mockResolvedValueOnce({})
    
    mockShopifyClient.calculateMetrics.mockResolvedValueOnce({
      shopId: mockShopId,
      fromDate: '2024-08-19T00:00:00.000Z',
      toDate: '2024-09-18T23:59:59.999Z',
      ordersCount: 5,
      grossRevenue: 750.00,
      currency: 'USD',
      avgOrderValue: 150.00,
      refundedAmount: 50.00,
      netRevenue: 700.00
    })

    // Create request
    const request = new NextRequest('http://localhost:3000/api/shops/test-shop-id-123/metrics')
    const params = Promise.resolve({ id: mockShopId })

    // Call API route
    const response = await GET(request, { params })
    const data = await response.json()

    // Verify response structure and types
    expect(response.status).toBe(200)
    expect(data).toEqual({
      shopId: expect.any(String),
      fromDate: expect.any(String),
      toDate: expect.any(String),
      ordersCount: expect.any(Number),
      grossRevenue: expect.any(Number),
      currency: expect.any(String),
      avgOrderValue: expect.any(Number),
      refundedAmount: expect.any(Number),
      netRevenue: expect.any(Number)
    })

    // Verify specific values
    expect(data.shopId).toBe(mockShopId)
    expect(data.ordersCount).toBe(5)
    expect(data.grossRevenue).toBe(750.00)
    expect(data.currency).toBe('USD')
    expect(data.avgOrderValue).toBe(150.00)
    expect(data.refundedAmount).toBe(50.00)
    expect(data.netRevenue).toBe(700.00)

    // Verify database was called
    expect(mockPrisma.shop.findUnique).toHaveBeenCalledWith({
      where: { id: mockShopId }
    })
  })

  it('should return 404 when shop not found', async () => {
    mockPrisma.shop.findUnique.mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/shops/nonexistent/metrics')
    const params = Promise.resolve({ id: 'nonexistent' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Shop not found' })
  })

  it('should return zero metrics when Shopify API fails', async () => {
    mockPrisma.shop.findUnique.mockResolvedValueOnce(mockShop)
    mockPrisma.auditLog.create.mockResolvedValueOnce({})

    // Mock Shopify client to throw error
    mockShopifyClient.calculateMetrics.mockRejectedValueOnce(new Error('API Error'))

    const request = new NextRequest('http://localhost:3000/api/shops/test-shop-id-123/metrics')
    const params = Promise.resolve({ id: mockShopId })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      shopId: mockShopId,
      fromDate: expect.any(String),
      toDate: expect.any(String),
      ordersCount: 0,
      grossRevenue: 0,
      currency: 'USD',
      avgOrderValue: 0,
      refundedAmount: 0,
      netRevenue: 0
    })
  })
})
