// API functions for Custom Tests
import { CustomTest } from '@/lib/types/test'

export const fetchUserTests = async (userId: string): Promise<{
  tests: CustomTest[]
}> => {
  const response = await fetch(`/api/tests/user/${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tests')
  }
  return response.json()
}

export const deleteCustomTest = async (testId: string): Promise<void> => {
  const response = await fetch(`/api/tests/${testId}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete custom test')
  }
}