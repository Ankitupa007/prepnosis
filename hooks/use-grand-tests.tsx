import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  explanation: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  images: string[];
  correct_option: 1 | 2 | 3 | 4;
  subject_id: string;
  subjects?: {
    id: string;
    name: string;
  };
  topics?: {
    id: string;
    name: string;
  };
  topic_id: string;
  difficulty_level: string;
}

interface TestQuestion {
  correct_option: number;
  id: string;
  question_id: string;
  question_order: number;
  marks: number;
  section_number?: number;
  question: Question;
  user_answer?: {
    selected_option: number | null;
    is_marked_for_review: boolean;
  };
}

interface Test {
  id: string;
  title: string;
  description: string;
  test_mode: "regular" | "exam";
  total_questions: number;
  total_marks: number;
  subjects: string[] | "all";
  share_code?: string;
  user_attempt?: {
    id: string;
    started_at: string;
    submitted_at: string | null;
    is_completed: boolean;
    total_score: number | null;
    section_times: {
      section: number;
      start_time: string | null;
      remaining_seconds: number;
    }[];
  };
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  isCorrect?: boolean;
}

interface StartTestResponse {
  attempt: {
    id: string;
    test_id: string;
    test_title: string;
    test_type: string;
    test_mode: string;
    started_at: string;
    duration_minutes: number;
    remaining_seconds: number;
    current_section: number;
    total_questions: number;
    total_marks: number;
    negative_marking: number;
    questions: TestQuestion[];
    section_times: any[];
  };
}

interface SubmitSectionResponse {
  attempt: any;
  results: {
    total_score: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    time_taken_minutes: number;
    total_questions: number;
    accuracy: number;
    current_section: number;
    next_section: number | null;
  };
}

const fetchTest = async (id: string) => {
  const response = await fetch(`/api/grand-tests/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch test");
  }
  return response.json();
};

const startTest = async (testId: string, userId: string) => {
  const response = await fetch(`/api/grand-tests/${testId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to start test");
  }
  return response.json();
};

const submitSection = async (
  testId: string,
  attemptId: string,
  answers: UserAnswer[],
  currentSection: number
) => {
  const response = await fetch(`/api/grand-tests/${testId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attemptId,
      answers,
      currentSection,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit section");
  }
  return response.json();
};

export const useGrandTest = (testId: string) => {
  const queryClient = useQueryClient();

  const testQuery = useQuery({
    queryKey: ["grandTest", testId],
    queryFn: () => fetchTest(testId),
    enabled: !!testId,
  });

  const startTestMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => startTest(testId, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(["grandTest", testId], {
        test: data.attempt,
        questions: data.attempt.questions,
        current_section: data.attempt.current_section,
        remaining_seconds: data.attempt.remaining_seconds,
      });
      toast.success("Test started successfully!");
    },
    onError: (error: any) => {
      console.error("Error starting test:", error);
      toast.error("Failed to start test");
    },
  });

  const submitSectionMutation = useMutation({
    mutationFn: ({
      attemptId,
      answers,
      currentSection,
    }: {
      attemptId: string;
      answers: UserAnswer[];
      currentSection: number;
    }) => submitSection(testId, attemptId, answers, currentSection),
    onSuccess: (data: SubmitSectionResponse) => {
      queryClient.invalidateQueries({ queryKey: ["grandTest", testId] });
      if (data.results.next_section) {
        toast.success(
          `Section ${data.results.current_section} submitted! Moving to Section ${data.results.next_section}`
        );
      } else {
        toast.success("Test submitted successfully!");
      }
    },
    onError: (error: any) => {
      console.error("Error submitting section:", error);
      toast.error("Failed to submit section");
    },
  });

  return {
    testQuery,
    startTest: startTestMutation.mutate,
    isStarting: startTestMutation.isPending,
    submitSection: submitSectionMutation.mutate,
    isSubmitting: submitSectionMutation.isPending,
  };
};
