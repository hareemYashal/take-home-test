'use client'

import { useState, useEffect, useTransition } from 'react'
import { ShopifyMetrics } from '@/lib/shopify'
import { fetchShopMetrics, disconnectShop } from '@/lib/actions'

interface MetricsDisplayProps {
  shopId: string
  onDisconnect: () => void
  onError: (error: string) => void
}

export function MetricsDisplay({ shopId, onDisconnect, onError }: MetricsDisplayProps) {
  const [metrics, setMetrics] = useState<ShopifyMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadMetrics = async () => {
    setIsLoading(true)
    setHasError(false)
    onError('') // Clear previous errors

    try {
      const result = await fetchShopMetrics(shopId)
      
      if (result.error) {
        setHasError(true)
        onError(result.error)
      } else if (result.success && result.metrics) {
        setMetrics(result.metrics)
        setHasError(false)
      }
    } catch (err) {
      setHasError(true)
      onError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await disconnectShop(shopId)
      
      if (result.error) {
        onError(result.error)
      } else {
        onDisconnect()
      }
    })
  }

  useEffect(() => {
    loadMetrics()
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Dubai'
    })
  }


  // Only show error state if there's actually an error and not loading
  if (!metrics && !isLoading && hasError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Unable to load metrics</p>
        <p className="text-slate-400 text-sm mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  // If still loading and no metrics yet, show loading state
  if (isLoading && !metrics) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="h-4 bg-slate-200 rounded w-20 animate-pulse mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-24 animate-pulse mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // If no metrics but not loading and no error, return null (shouldn't happen)
  if (!metrics) {
    return null
  }

  const metricCards = [
    {
      title: 'Total Orders',
      value: metrics.ordersCount.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'blue',
      change: metrics.ordersCount > 0 ? '+12%' : '0%'
    },
    {
      title: 'Gross Revenue',
      value: formatCurrency(metrics.grossRevenue, 'CAD'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'emerald',
      change: metrics.grossRevenue > 0 ? '+8%' : '0%'
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(metrics.avgOrderValue, 'CAD'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'purple',
      change: metrics.avgOrderValue > 0 ? '+5%' : '0%'
    },
    {
      title: 'Net Revenue',
      value: formatCurrency(metrics.netRevenue, 'CAD'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'orange',
      change: metrics.netRevenue > 0 ? '+15%' : '0%'
    }
  ]

  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', change: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', change: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', change: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', change: 'text-orange-600' }
  }

  return (
    <div className="space-y-8">
      {/* Header with store info and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Store Analytics</h2>
          <p className="text-slate-500 mt-1">
            {formatDate(metrics.fromDate)} - {formatDate(metrics.toDate)}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <button
            onClick={handleDisconnect}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                Disconnecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Disconnect
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const colors = colorClasses[card.color as keyof typeof colorClasses]
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <div className={colors.icon}>
                    {card.icon}
                  </div>
                </div>
                <span className={`text-sm font-medium ${colors.change}`}>
                  {card.change}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Details */}
      {metrics.refundedAmount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Refunds Processed</h3>
              <p className="text-amber-700">
                {formatCurrency(metrics.refundedAmount, 'CAD')} in refunds were processed during this period
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no data */}
      {metrics.ordersCount === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Orders Found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No orders were found for the selected time period. Try creating some test orders in your Shopify store.
          </p>
        </div>
      )}
    </div>
  )
}