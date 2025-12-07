// Simplified Section Page with New Components Integration
// This is a reference implementation - integrate these patterns into your existing page.tsx

// Key changes to make in your existing page.tsx:

// 1. ADD THESE STATE VARIABLES (around line 132):
const [examPattern, setExamPattern] = useState<'NEET_PG' | 'INICET'>('NEET_PG');
const [questionStates, setQuestionStates] = useState<Record<string, any>>({});

// 2. UPDATE fetchTest function to get exam pattern (around line 163):
const fetchTest = async () => {
  try {
    const response = await fetch(`/api/grand-tests/${id}`);
    if (!response.ok) throw new Error("Failed to fetch test");
    
    const data = await response.json();
    setTest(data.test);
    setExamPattern(data.test.exam_pattern); // ADD THIS LINE
    
    // Filter questions for current section
    const sectionQuestions = data.questions.filter(
      (q: any) => q.section_number === Number(section)
    );
    setQuestions(sectionQuestions);
    setCurrentSection(data.current_section || Number(section));
    setRemainingSeconds(data.remaining_seconds || 2520);
    
    // ... rest of your existing code
  } catch (error) {
    console.error("Error fetching test:", error);
    toast.error("Failed to load test");
  } finally {
    setIsLoading(false);
  }
};

// 3. REPLACE the existing timer useEffect (lines 134-150) with:
// Remove it completely - we'll use SectionTimer component instead

// 4. REPLACE handleAnswerSelect function (lines 261-295) with:
const handleAnswerSelect = async (selectedOption: number | null) => {
  if (showReviewMode || testCompleted) return;
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQuestion.question.correct_option;

  // Update local state
  const updatedAnswers = userAnswers.map((answer) =>
    answer.questionId === currentQuestion.question_id
      ? { ...answer, selectedOption, isCorrect }
      : answer
  );
  setUserAnswers(updatedAnswers);

  // Save to server with new API format
  try {
    await fetch(`/api/grand-tests/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        answer: {
          questionId: currentQuestion.question_id,
          selectedOption,
          isCorrect,
          isMarkedForReview: false,
          sectionNumber: Number(section),
        },
        currentSection: Number(section),
      }),
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    toast.error("Failed to save answer");
  }
};

// 5. UPDATE submitSection function (around line 339) to use new API:
const submitSection = async () => {
  if (!attemptId || !test || testCompleted) return;
  
  try {
    const response = await fetch(`/api/grand-tests/${test.id}/section-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        sectionNumber: Number(section),
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.nextSection) {
        toast.success(`Section ${section} submitted! Moving to Section ${data.nextSection}`);
        router.push(`/grand-tests/${id}/section/${data.nextSection}`);
      } else {
        // Last section
        setShowSubmitTestModel(true);
      }
    } else {
      throw new Error("Failed to submit section");
    }
  } catch (error) {
    console.error("Error submitting section:", error);
    toast.error("Failed to submit section");
  }
};

// 6. REPLACE the header section (lines 745-773) with:
<header className="bg-background/80 backdrop-blur-sm border-border border-b sticky top-0 z-10">
  <div className="container mx-auto py-4 flex items-center justify-between px-4">
    <div className="flex items-center gap-3">
      <SidebarTrigger
        variant={"secondary"}
        className="p-3 rounded-full w-10 h-10"
      />
      <div className="font-semibold">
        Section {section} of {getExamPatternConfig(examPattern).totalSections}
      </div>
    </div>

    {/* Use SectionTimer Component */}
    {!testCompleted && (
      <SectionTimer
        initialSeconds={remainingSeconds}
        onTimeUp={submitSection}
        isPaused={testCompleted}
      />
    )}

    <div className="flex items-center gap-4">
      {!showReviewMode ? (
        <Button onClick={submitSection} disabled={testCompleted}>
          Submit Section
        </Button>
      ) : (
        <Button onClick={toggleReviewMode} variant="outline">
          See Results
        </Button>
      )}
    </div>
  </div>
</header>

// 7. REPLACE the question navigator section (lines 798-858) with:
<div className="py-2 px-6 w-1/3 max-w-md">
  <QuestionNavigator
    totalQuestions={questions.length}
    currentQuestionIndex={currentQuestionIndex}
    questionStates={getAllQuestionStates()}
    onNavigate={navigateToQuestion}
    disabled={testCompleted && !showReviewMode}
  />
</div>

// 8. ADD this helper function to get question states:
const getAllQuestionStates = () => {
  const states: Record<number, any> = {};
  questions.forEach((q, index) => {
    const answer = userAnswers.find(a => a.questionId === q.question_id);
    
    if (!answer || answer.selectedOption === null) {
      states[index] = 'not_visited';
    } else {
      states[index] = 'answered';
    }
  });
  return states;
};

// 9. OPTIONALLY replace the question display section (lines 860-1068) with QuestionDisplay component:
<div className="mx-auto flex justify-center w-full max-w-4xl px-2">
  <div className="max-w-2xl w-full">
    <QuestionDisplay
      question={currentQuestion.question}
      selectedOption={currentAnswer?.selectedOption || null}
      isMarkedForReview={false}
      onSelectOption={(option) => handleAnswerSelect(option)}
      onClearResponse={() => handleAnswerSelect(null)}
      onToggleMarkForReview={() => {/* Implement if needed */}}
      showExplanation={shouldShowExplanation}
      disabled={showReviewMode}
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
</div>

// 10. UPDATE section navigation for review mode (lines 776-796):
{testCompleted && showReviewMode && (
  <div className="px-6">
    <p className="font-semibold">Sections</p>
    <div className="flex items-center justify-start gap-2 mt-4">
      {Array.from({ length: getExamPatternConfig(examPattern).totalSections }, (_, i) => i + 1).map((sec) => (
        <button
          key={sec}
          onClick={() => router.push(`/grand-tests/${id}/section/${sec}`)}
          className={`px-3 py-2 rounded-md text-xs font-semibold transition ${
            Number(section) === sec
              ? "bg-primary text-background"
              : "bg-secondary text-foreground hover:bg-gray-300"
          }`}
        >
          {sec}
        </button>
      ))}
    </div>
  </div>
)}

// SUMMARY OF CHANGES:
// - Added exam pattern state
// - Replaced manual timer with SectionTimer component
// - Updated answer submission to new API format
// - Updated section submit to new API
// - Integrated QuestionNavigator component
// - Made section navigation dynamic based on exam pattern
// - Optionally use QuestionDisplay component for cleaner code
