// apps/frontend/src/pages/debug.tsx (or debug/page.tsx if using app directory)
'use client'

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    const testResults: any = {}

    // Test 1: Direct fetch to backend
    try {
      const response = await fetch('http://localhost:3101')
      testResults.directFetch = {
        success: true,
        status: response.status,
        data: await response.text()
      }
    } catch (error) {
      testResults.directFetch = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    // Test 2: Health check
    try {
      const response = await fetch('http://localhost:3101/health')
      testResults.healthCheck = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : await response.text()
      }
    } catch (error) {
      testResults.healthCheck = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    // Test 3: API endpoint
    try {
      const response = await fetch('http://localhost:3101/api/bookings/my', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
      testResults.apiEndpoint = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : await response.text()
      }
    } catch (error) {
      testResults.apiEndpoint = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Backend Debug Test</h1>
      
      <Button onClick={testBackend} disabled={loading} className="mb-6">
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </Button>

      <div className="grid gap-4">
        {Object.entries(results).map(([testName, result]: [string, any]) => (
          <Card key={testName} className="p-4">
            <h3 className="font-bold mb-2 capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h3>
            <div className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                Status: {result.success ? 'SUCCESS' : 'FAILED'}
              </p>
              {result.status && <p>HTTP Status: {result.status}</p>}
              {result.error && <p>Error: {result.error}</p>}
              {result.data && (
                <pre className="mt-2 text-xs overflow-auto">
                  {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}