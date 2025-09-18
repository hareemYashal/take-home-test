import { Card, CardContent } from './card'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-12">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
          <p className={`text-gray-600 ${textSizeClasses[size]}`}>{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]}`}></div>
  )
}
