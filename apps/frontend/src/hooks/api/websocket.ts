import { useEffect, useRef, useState } from 'react'

import { api } from '../../lib/api'
import { WebSocketEvent } from '../../types'
import { toast } from '../use-toast'

export const useWebSocket = (enabled: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    const token = api.getToken()
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
          
          // Handle different event types
          switch (data.event) {
            case 'booking_status_update':
              toast.info(`Booking ${data.data.bookingId} status updated: ${data.data.status}`)
              break
            case 'team_assigned':
              toast.success(`Team assigned to your booking: ${data.data.team.name}`)
              break
            case 'new_booking':
              toast.info(`New ${data.data.booking.priority} booking received`)
              break
            case 'emergency_alert':
              toast.error(`EMERGENCY: ${data.data.booking.description}`)
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
        
        // Attempt to reconnect if not max attempts reached
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

  // Cleanup on unmount
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