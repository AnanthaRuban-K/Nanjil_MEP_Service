// hooks/use-websocket.ts
import { useEffect, useRef, useState } from 'react'
import { WebSocketEvent } from '../../types'
import { toast } from '../../hooks/use-toast'

// Helper function to get auth token (same logic as in api.ts)
const getAuthToken = (): string => {
  // For development
  if (process.env.NODE_ENV === 'development') {
    return 'test-token'
  }
  
  // For production, get from Clerk or your auth provider
  // return getClerkToken() or similar
  return 'test-token'
}

export const useWebSocket = (enabled: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    const token = getAuthToken()
    if (!token || !enabled) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/websocket?token=${token}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data)
          setLastMessage(data)
          
          // Handle different event types with proper toast usage
          switch (data.event) {
            case 'booking_status_update':
              toast({
                title: 'Booking Updated',
                description: `Booking ${data.data.bookingId} status updated: ${data.data.status}`,
                variant: 'default'
              })
              break
            case 'team_assigned':
              toast({
                title: 'Team Assigned',
                description: `Team assigned to your booking: ${data.data.team.name}`,
                variant: 'default'
              })
              break
            case 'new_booking':
              toast({
                title: 'New Booking',
                description: `New ${data.data.booking.priority} booking received`,
                variant: 'default'
              })
              break
            case 'emergency_alert':
              toast({
                title: 'EMERGENCY ALERT',
                description: data.data.booking.description,
                variant: 'destructive'
              })
              break
            default:
              console.log('Unhandled WebSocket event:', data.event)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        
        if (reconnectAttempts.current < maxReconnectAttempts && enabled) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    reconnectAttempts.current = 0
  }

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  }
}