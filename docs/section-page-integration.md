# Section Page Integration Example

This document shows how to integrate all the new components and hooks into the section page.

## Key Changes Needed in `app/(dashboard)/grand-tests/[id]/section/[section]/page.tsx`

### 1. Import New Components and Hooks

```typescript
import { QuestionNavigator } from '@/components/grand-tests/QuestionNavigator';
import { SectionTimer } from '@/components/grand-tests/SectionTimer';
import { QuestionDisplay } from '@/components/grand-tests/QuestionDisplay';
import { useQuestionState } from '@/hooks/grand-tests/useQuestionState';
import { useSectionTimer } from '@/hooks/grand-tests/useSectionTimer';
import { getExamPatternConfig } from '@/lib/constants/exam-patterns';
```

### 2. Initialize Hooks

```typescript
// Inside component
const { id, section } = use(params);
const router = useRouter();
const { user } = useAuth();

// Fetch test data
const { data: testData, isLoading } = useQuery({
  queryKey: ['grandTest', id, section],
  queryFn: async () => {
    const response = await fetch(`/api/grand-tests/${id}`);
    return response.json();
  },
});

const test = testData?.test;
const questions = testData?.questions?.filter(
  (q: any) => q.section_number === Number(section)
);
const attemptId = test?.user_attempt?.id;

// Get exam pattern config
const examConfig = test ? getExamPatternConfig(test.exam_pattern) : null;
const sectionConfig = examConfig?.sections.find(s => s.sectionNumber === Number(section));

// Initialize question state hook
const {
  selectAnswer,
  clearAnswer,
  toggleMarkForReview,
  getQuestionState,
  getAllQuestionStates,
  isSaving,
} = useQuestionState({
  attemptId,
  testId: id,
  currentSection: Number(section),
  initialStates: {}, // Map from questions
});

// Initialize timer hook
const { remainingSeconds, isWarning, formatTime } = useSectionTimer({
  examPattern: test?.exam_pattern,
  sectionNumber: Number(section),
  initialSeconds: testData?.remaining_seconds || sectionConfig?.durationSeconds || 2520,
  onTimeUp: handleSectionSubmit,
  isPaused: testCompleted,
});
```

### 3. Render Layout

```typescript
return (
  <div className="min-h-screen flex flex-col">
    {/* Header with Timer */}
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">
            Section {section} of {examConfig?.totalSections}
          </h1>
        </div>
        
        <SectionTimer
          initialSeconds={remainingSeconds}
          onTimeUp={handleSectionSubmit}
          isPaused={testCompleted}
        />

        {!testCompleted && (
          <Button onClick={() => setShowSubmitDialog(true)}>
            Submit Section
          </Button>
        )}
      </div>
    </header>

    {/* Main Content */}
    <div className="flex-1 container mx-auto py-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Display - 2/3 width */}
        <div className="lg:col-span-2">
          <QuestionDisplay
            question={currentQuestion.question}
            selectedOption={localStates[currentQuestion.question_id]?.selectedOption || null}
            isMarkedForReview={localStates[currentQuestion.question_id]?.isMarkedForReview || false}
            onSelectOption={(option) => 
              selectAnswer(
                currentQuestion.question_id,
                option,
                currentQuestion.question.correct_option
              )
            }
            onClearResponse={() => clearAnswer(currentQuestion.question_id)}
            onToggleMarkForReview={() => toggleMarkForReview(currentQuestion.question_id)}
            showExplanation={testCompleted}
            disabled={testCompleted}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Question Navigator - 1/3 width */}
        <div className="lg:col-span-1">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestionIndex}
            questionStates={getAllQuestionStates()}
            onNavigate={navigateToQuestion}
            disabled={testCompleted}
          />
        </div>
      </div>
    </div>
  </div>
);
```

### 4. Handle Section Submission

```typescript
const handleSectionSubmit = async () => {
  try {
    const response = await fetch(`/api/grand-tests/${id}/section-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        sectionNumber: Number(section),
      }),
    });

    const data = await response.json();

    if (data.nextSection) {
      toast.success(`Section ${section} submitted! Moving to Section ${data.nextSection}`);
      router.push(`/grand-tests/${id}/section/${data.nextSection}`);
    } else {
      // Last section - show final submit dialog
      setShowFinalSubmitDialog(true);
    }
  } catch (error) {
    toast.error('Failed to submit section');
  }
};
```

### 5. Prevent Backward Navigation

```typescript
// Add this effect to prevent going back to previous sections
useEffect(() => {
  const handlePopState = (e: PopStateEvent) => {
    e.preventDefault();
    toast.error('Cannot navigate to previous sections');
    router.push(`/grand-tests/${id}/section/${section}`);
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [id, section, router]);
```

## Complete Example Structure

```
Section Page
├── Header
│   ├── Section Title
│   ├── SectionTimer Component
│   └── Submit Button
├── Main Content (Grid Layout)
│   ├── Question Display (2/3 width)
│   │   ├── QuestionDisplay Component
│   │   │   ├── Question Text
│   │   │   ├── Images
│   │   │   ├── Options (Radio Group)
│   │   │   ├── Clear Response Button
│   │   │   ├── Mark for Review Checkbox
│   │   │   └── Explanation (if review mode)
│   │   └── Navigation Buttons
│   │       ├── Previous Button
│   │       └── Next Button
│   └── Question Navigator (1/3 width)
│       └── QuestionNavigator Component
│           ├── Question Grid (color-coded)
│           └── Legend with Statistics
└── Dialogs
    ├── Submit Section Confirmation
    └── Final Submit Confirmation
```

## State Management Flow

1. **Question State Updates**:
   - User selects option → `selectAnswer()` → Local state updated → Debounced API call
   - User clears response → `clearAnswer()` → Local state updated → API call
   - User toggles review → `toggleMarkForReview()` → Local state updated → Immediate API call

2. **Timer Management**:
   - Timer counts down every second
   - Warning state at 5 minutes
   - Auto-submit when timer reaches 0

3. **Section Navigation**:
   - Submit section → API call → Navigate to next section
   - Last section → Show final submit dialog
   - Prevent backward navigation via browser back button

## Review Mode

When test is completed (`test.user_attempt.is_completed === true`):
- Show all sections in navigation
- Allow section switching
- Display explanations
- Disable answer modifications
- Show correct/incorrect indicators

This integration provides a complete, production-ready section page with all the features specified in the requirements.
