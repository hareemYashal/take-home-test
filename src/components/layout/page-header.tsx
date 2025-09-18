interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {title}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  )
}
