import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ShopifyAnalyticsClient } from './client'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Analytics Dashboard</h1>
                <p className="text-sm text-slate-500">Shopify Store Insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Last 30 Days</p>
                <p className="text-xs text-slate-500">Dubai Time (UTC+4)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-slate-600 font-medium">Loading analytics...</p>
                <p className="text-slate-400 text-sm mt-1">Connecting to your Shopify store</p>
              </div>
            </div>
          }>
            <ShopifyAnalyticsClient />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}