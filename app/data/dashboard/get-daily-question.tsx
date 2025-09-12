
export async function getDailyQuestion() {
    const res = await fetch("/api/daily-question");
    return await res.json();
}

export async function submitDailyQuestion(data: { selected_option: number }) {
    const response = await fetch('/api/daily-question/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to submit answer');
    }
    return response.json();
}