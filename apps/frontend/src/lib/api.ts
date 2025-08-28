// lib/api.ts
import axios, { AxiosInstance } from 'axios'

class ApiClient {
  private client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error.response?.data || error)
      }
    )
  }

  // Add the missing getToken method
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('clerk-token')
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params })
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data)
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data)
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url)
  }
}

export const api = new ApiClient()