'use client'

import { useState, useTransition } from 'react'
import { initiateShopifyOAuth } from '@/lib/actions'

interface ConnectFormProps {
  onError: (error: string) => void
}

export function ConnectForm({ onError }: ConnectFormProps) {
  const [shopDomain, setShopDomain] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      onError('') // Clear previous errors
      
      const result = await initiateShopifyOAuth(formData)
      
      if (result?.error) {
        onError(result.error)
      }
      // If successful, the Server Action will redirect to Shopify
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.closest('form')
      if (form) {
        const formData = new FormData(form)
        handleSubmit(formData)
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 2.25a.75.75 0 01.75-.75h5.5c.414 0 .75.336.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zm.75 1.5v4h4v-4h-4zM1.5 2.25a.75.75 0 01.75-.75h5.5c.414 0 .75.336.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zm.75 1.5v4h4v-4h-4zM15.5 16.25a.75.75 0 01.75-.75h5.5c.414 0 .75.336.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zm.75 1.5v4h4v-4h-4zM1.5 16.25a.75.75 0 01.75-.75h5.5c.414 0 .75.336.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zm.75 1.5v4h4v-4h-4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connect Store</h2>
              <p className="text-emerald-100 text-sm">Link your Shopify store for analytics</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="shopDomain" className="block text-sm font-semibold text-slate-700 mb-3">
                Store Domain
              </label>
              <div className="relative">
                <input
                  id="shopDomain"
                  name="shopDomain"
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your-store.myshopify.com"
                  disabled={isPending}
                  className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter your Shopify domain (e.g., mystore.myshopify.com)
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isPending || !shopDomain.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Connect to Shopify</span>
                </div>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-slate-400 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Secure Connection</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your store data is encrypted and stored securely. We only access the data you authorize.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}