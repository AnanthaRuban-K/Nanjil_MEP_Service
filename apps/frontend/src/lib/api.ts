// apps/frontend/src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101'

// Get auth token (implement based on your auth system)
const getAuthToken = (): string => {
  // For development
  if (process.env.NODE_ENV === 'development') {
    return 'test-token'
  }
  
  // For production, get from Clerk or your auth provider
  // return getClerkToken() or similar
  return 'test-token'
}

export const apiClient = {
  async post(endpoint: string, data: FormData | object, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Authorization': `Bearer ${getAuthToken()}`,
    }
    
    // Don't set Content-Type for FormData - let browser handle it
    if (!(data instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    }
    
    try {
      console.log('API Request:', { method: 'POST', url, headers: config.headers })
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Network error'
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`
        }
        
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      return result
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },
  
  async get(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }
    
    try {
      console.log('API Request:', { method: 'GET', url })
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Network error'
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`
        }
        
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      return result
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}