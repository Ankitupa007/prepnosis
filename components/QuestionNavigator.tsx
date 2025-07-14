"use client";
import { useQuery } from "@tanstack/react-query";

export default function QuestionNavigator({
  testId,
  section,
  answers,
  setAnswers,
  marked,
  setMarked,
}: any) {
  const { data } = useQuery({
    queryKey: ["questions", testId, section],
    queryFn: async () => {
      const res = await fetch(
        `/api/grand-tests/${testId}/questions?section=${section}`
      );
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      {data?.questions.map((q: any, idx: number) => (
        <div key={q.id} className="p-4 border rounded-xl">
          <p className="font-medium">
            Q{idx + 1}: {q.question_text}
          </p>
          {[1, 2, 3, 4].map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setAnswers((prev: any) => ({ ...prev, [q.id]: opt }))
              }
              className={`block w-full text-left px-3 py-2 border rounded mt-2 ${
                answers[q.id] === opt ? "bg-blue-100" : ""
              }`}
            >
              {q[`option_${String.fromCharCode(96 + opt)}`]}
            </button>
          ))}
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={marked[q.id] || false}
              onChange={(e) =>
                setMarked((prev: any) => ({
                  ...prev,
                  [q.id]: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Mark for review
          </label>
        </div>
      ))}
    </div>
  );
}
