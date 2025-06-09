// components/share-code-input.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Share2, ArrowRight, Loader2 } from 'lucide-react'
import test from 'node:test'

export default function ShareCodeInput() {
  const router = useRouter()
  const [shareCode, setShareCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareCode.trim()) {
      toast.error('Please enter a share code')
      return
    }

    // Clean and validate share code format
    const cleanCode = shareCode.trim().toUpperCase().replace(/\s+/g, '')

    if (cleanCode.length !== 8) {
      toast.error('Share code must be 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      // Test if the share code is valid before navigating
      const response = await fetch(`/api/tests/share/${cleanCode}`)
      if (response.ok) {
        const data = await response.json()

        const testId = data.test.id
        // Navigate to the shared test page
        router.push(`/custom-test/${testId}/`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Invalid share code')
      }
    } catch (error) {
      console.error('Error validating share code:', error)
      toast.error('Failed to validate share code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format input (uppercase, max 8 chars)
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    setShareCode(value)
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent border-none shadow-none">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareCode">Enter Share Code</Label>
            <Input
              id="shareCode"
              type="text"
              autoComplete='off'
              value={shareCode}
              onChange={handleInputChange}
              placeholder="ABC12345"
              className="text-center text-lg font-mono tracking-widest"
              maxLength={8}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 text-center">
              Example: ABC12345
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#6FCCCA] hover:bg-[#6FCCCA]/90"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Access Test
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>


          {shareCode.length > 0 && shareCode.length < 8 && (
            <p className="text-xs text-orange-600 text-center">
              Share code must be 8 characters ({shareCode.length}/8)
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}