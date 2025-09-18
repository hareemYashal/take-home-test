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

export function redactSecrets(obj: unknown, visited = new WeakSet(), depth = 0): unknown {
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
  const redacted: { [key: string]: unknown } = {}
  const objRecord = obj as Record<string, unknown>

  for (const key in objRecord) {
    if (!Object.prototype.hasOwnProperty.call(objRecord, key)) continue
    
    const lowerKey = key.toLowerCase()
    const value = objRecord[key]

    if (SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
      if (typeof value === 'string' && value.length > 0) {
        redacted[key] = `${value.substring(0, 4)}****`
      } else {
        redacted[key] = '****'
      }
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSecrets(value, visited, depth + 1)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

export function safeLog(message: string, data?: unknown) {
  if (data) {
    console.log(message, redactSecrets(data))
  } else {
    console.log(message)
  }
}

export function safeError(message: string, error?: unknown) {
  if (error) {
    console.error(message, redactSecrets(error))
  } else {
    console.error(message)
  }
}
