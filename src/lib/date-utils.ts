// Dubai timezone is UTC+4
export function getDubaiDate(date?: Date): Date {
  const now = date || new Date()
  // Get current time in Dubai timezone
  const dubaiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dubai"}))
  return dubaiTime
}

export function getLast30DaysRange(): { fromDate: string; toDate: string } {
  // Get current date in Dubai timezone
  const now = new Date()
  const dubaiNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dubai"}))
  
  // Set to end of today in Dubai time (23:59:59)
  const toDate = new Date(dubaiNow)
  toDate.setHours(23, 59, 59, 999)
  
  // Set to start of 30 days ago in Dubai time (00:00:00)
  const fromDate = new Date(dubaiNow)
  fromDate.setDate(fromDate.getDate() - 29) // 30 days inclusive of today
  fromDate.setHours(0, 0, 0, 0)
  
  // Convert back to UTC for API calls
  return {
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString()
  }
}

export function formatDateForShopify(date: Date): string {
  return date.toISOString()
}

export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Dubai'
  })
}
