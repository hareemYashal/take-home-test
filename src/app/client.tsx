'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConnectForm } from '@/components/shopify/connect-form'
import { MetricsDisplay } from '@/components/shopify/metrics-display'
import { Alert } from '@/components/ui/alert'

// Client Component - handles all interactive functionality
export function ShopifyAnalyticsClient() {
  const [connectedShopId, setConnectedShopId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const connected = searchParams.get('connected')
    const errorParam = searchParams.get('error')
    
    if (connected) {
      setConnectedShopId(connected)
      setError('')
    }
    
    if (errorParam) {
      switch (errorParam) {
        case 'missing_params':
          setError('OAuth failed: Missing required parameters')
          break
        case 'oauth_failed':
          setError('OAuth failed: Could not connect to Shopify')
          break
        default:
          setError('An error occurred during connection')
      }
    }
  }, [searchParams])

  const handleDisconnect = () => {
    setConnectedShopId(null)
    setError('')
    window.history.replaceState({}, '', '/')
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-900">Connection Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!connectedShopId ? (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect Your Store</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Get comprehensive analytics for your Shopify store. View orders, revenue, and performance metrics for the last 30 days.
            </p>
          </div>
          <ConnectForm onError={setError} />
        </div>
      ) : (
        <MetricsDisplay 
          shopId={connectedShopId}
          onDisconnect={handleDisconnect}
          onError={setError}
        />
      )}
    </div>
  )
}
