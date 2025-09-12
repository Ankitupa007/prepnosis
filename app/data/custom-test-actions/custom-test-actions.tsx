import {CustomTest, Test} from '@/lib/types/test';


// Get a custom test

export const getCustomTests = async (userId: string): Promise<{
    tests: CustomTest[]
}> => {
    const response = await fetch(`/api/tests/user/${userId}`)
    if (!response.ok) {
        throw new Error('Failed to fetch tests')
    }
    return response.json()
}

// Create a custom test
export async function createCustomTest(testData: Partial<Test>) {
    const response = await fetch('/api/tests/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    });

    if (!response.ok) {
        throw new Error('Failed to create test');
    }

    return response.json();
}

// Update a custom test
export async function updateCustomTest({ id, testData }: { id: string; testData: Partial<Test> }) {
    const response = await fetch(`/api/tests/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    });

    if (!response.ok) {
        throw new Error('Failed to update test');
    }

    return response.json();
}

// Delete a custom test
export async function deleteCustomTest(testId: string) {
    const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete test');
    }

    return response.json();
}

// Start a custom test
export async function startCustomTest(testId: string) {
    const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to start test');
    }

    return response.json();
}

// Submit a custom test
export async function submitCustomTest({ attemptId, answers }: { attemptId: string; answers: any[] }) {
    const response = await fetch(`/api/tests/${attemptId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
        throw new Error('Failed to submit test');
    }

    return response.json();
}