interface RedactableObject {
  [key: string]: any
}

const SENSITIVE_KEYS = [
  'access_token',
  'accessToken',
  'token',
  'secret',
  'password',
  'key',
  'authorization',
  'auth'
]

export function redactSecrets(obj: any, visited = new WeakSet(), depth = 0): any {
  // Prevent infinite recursion with depth limit and circular reference detection
  if (depth > 10 || !obj || typeof obj !== 'object') {
    return obj
  }

  // Handle circular references
  if (visited.has(obj)) {
    return '[Circular Reference]'
  }
  visited.add(obj)

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactSecrets(item, visited, depth + 1))
  }

  // Handle Error objects specially
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: obj.stack ? obj.stack.substring(0, 500) + '...' : undefined
    }
  }

  // Handle regular objects
  const redacted: { [key: string]: any } = {}

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    
    const lowerKey = key.toLowerCase()
    
    if (SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
      if (typeof obj[key] === 'string' && obj[key].length > 0) {
        redacted[key] = `${obj[key].substring(0, 4)}****`
      } else {
        redacted[key] = '****'
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redacted[key] = redactSecrets(obj[key], visited, depth + 1)
    } else {
      redacted[key] = obj[key]
    }
  }

  return redacted
}

export function safeLog(message: string, data?: any) {
  if (data) {
    console.log(message, redactSecrets(data))
  } else {
    console.log(message)
  }
}

export function safeError(message: string, error?: any) {
  if (error) {
    console.error(message, redactSecrets(error))
  } else {
    console.error(message)
  }
}
