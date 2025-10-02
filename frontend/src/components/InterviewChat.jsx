import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function InterviewChat({ token }) {
  const TOTAL_QUESTIONS = 6; // 6 questions (indices 0..5)

  // UI state
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [success, setSuccess] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0); // for UI only
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // Refs to avoid stale closures in timers/callbacks
  const questionIndexRef = useRef(0);
  const currentQuestionRef = useRef(null);
  const startTimeRef = useRef(null);
  const inputDisabledRef = useRef(true);
  const toastIdRef = useRef(null);
  const toastIntervalRef = useRef(null);
  const questionTimeoutRef = useRef(null);
  const answeredRef = useRef(false);
  const countdownTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const [response, setResponse] = useState({});
  const baseUrl =
    import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";

  // keep refs in sync when state changes (for debugger/consistency)
  useEffect(() => {
    inputDisabledRef.current = inputDisabled;
  }, [inputDisabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial interview eligibility check
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/interview/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setResponse(data);
        setSuccess(data.success);

        if (data.success) {
          // countdown before starting
          let t = 10;
          setCountdown(t);
          countdownTimerRef.current = setInterval(() => {
            t -= 1;
            setCountdown(t);
            if (t <= 0) {
              clearInterval(countdownTimerRef.current);
              setLoading(false);
            }
          }, 1000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setSuccess(false);
        setLoading(false);
      }
    };

    fetchData();

    // cleanup on unmount
    return () => {
      clearInterval(countdownTimerRef.current);
      clearInterval(toastIntervalRef.current);
      clearTimeout(questionTimeoutRef.current);
    };
  }, [baseUrl, token]);

  // Start interview after countdown
  useEffect(() => {
    if (!loading && success) {
      setInterviewStarted(true);
      // ensure refs start at zero
      questionIndexRef.current = 0;
      setQuestionIndex(0);
      fetchNextQuestion();
    }
  }, [loading, success]);

  // Difficulty by index (kept as your original logic)
  const getDifficultyByIndex = (index) => {
    if (index < 2) return "easy";
    if (index < 4) return "medium";
    return "hard";
  };

  // Helper to safely clear per-question timers
  const clearQuestionTimers = () => {
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
      questionTimeoutRef.current = null;
    }
    if (toastIntervalRef.current) {
      clearInterval(toastIntervalRef.current);
      toastIntervalRef.current = null;
    }
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  // Start a toast countdown and return interval id
  const startToastCountdown = (timeLimitMs) => {
    let secondsLeft = Math.ceil(timeLimitMs / 1000);
    const id = toast(`⏳ You have ${secondsLeft}s left`, {
      autoClose: false,
      position: "top-right",
    });
    toastIdRef.current = id;

    toastIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(toastIntervalRef.current);
        toastIntervalRef.current = null;
        toast.dismiss(id);
        toastIdRef.current = null;
      } else {
        toast.update(id, {
          render: `⏳ You have ${secondsLeft}s left`,
          autoClose: false,
        });
      }
    }, 1000);

    return id;
  };

  // Fetch next question and set up timers
  const fetchNextQuestion = async () => {
    // prevent multiple fetchNextQuestion invocations from overlapping
    clearQuestionTimers();
    answeredRef.current = false;

    const currentIdx = questionIndexRef.current;
    // if we've already served the configured number of questions -> finish
    if (currentIdx >= TOTAL_QUESTIONS) {
      setInterviewStarted(false);
      toast.success("🎉 Thanks for attending!", { position: "top-center" });
      return;
    }

    // use difficulty (if needed)
    const difficulty = getDifficultyByIndex(currentIdx);

    try {
      const res = await fetch(`${baseUrl}/api/interview/start`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const question = data.content;

      // add LLM question to chat
      setMessages((prev) => [...prev, { sender: "llm", text: question }]);

      // increment index (we consider this question 'served')
      questionIndexRef.current = currentIdx + 1;
      setQuestionIndex(questionIndexRef.current);

      // set current question refs/state
      currentQuestionRef.current = question;
      setCurrentQuestion(question);

      // allow input
      setInputDisabled(false);
      inputDisabledRef.current = false;

      // set start time
      startTimeRef.current = Date.now();

      // start toast countdown and question timeout
      const timeLimit = 20000; // 20s per question
      startToastCountdown(timeLimit);

      // set auto-submit timeout
      questionTimeoutRef.current = setTimeout(async () => {
        // if already answered manually, just return
        if (answeredRef.current) return;
        answeredRef.current = true;

        // clear toast timers and dismiss
        if (toastIntervalRef.current) {
          clearInterval(toastIntervalRef.current);
          toastIntervalRef.current = null;
        }
        if (toastIdRef.current !== null) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }

        // mark input disabled
        if (!inputDisabledRef.current) {
          inputDisabledRef.current = true;
          setInputDisabled(true);
        }

        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const q = currentQuestionRef.current;
        const answer = "No answer";

        setMessages((prev) => [
          ...prev,
          { sender: "llm", text: "⏰ Time's up for this question!" },
          { sender: "user", text: answer },
          { sender: "llm", text: "🔍 Your answer is being verified..." },
        ]);

        // submit to backend
        try {
          await fetch(`${baseUrl}/api/interview/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ question: q, answer, timeTaken }),
          });
        } catch (err) {
          toast.error("❌ Failed to submit answer", { position: "top-right" });
        }

        // proceed to next question or finish
        if (questionIndexRef.current < TOTAL_QUESTIONS) {
          // small delay to let messages render nicely, optional
          setTimeout(fetchNextQuestion, 600);
        } else {
          setInterviewStarted(false);
          toast.success("🎉 Thanks for attending!", { position: "top-center" });
        }
      }, 20000);
    } catch (err) {
      console.error("Failed to fetch question:", err);
      toast.error("Failed to fetch question", { position: "top-right" });
    }
  };

  // Handle manual submit
  const handleSend = async () => {
    // trim and check
    if (!userInput.trim() || inputDisabledRef.current) return;

    // mark answered so auto-submit won't run
    answeredRef.current = true;

    // clear timers for this question
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
      questionTimeoutRef.current = null;
    }
    if (toastIntervalRef.current) {
      clearInterval(toastIntervalRef.current);
      toastIntervalRef.current = null;
    }
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const answer = userInput || "No answer";
    const question = currentQuestionRef.current;

    setMessages((prev) => [...prev, { sender: "user", text: answer }]);
    setUserInput("");
    setInputDisabled(true);
    inputDisabledRef.current = true;

    setMessages((prev) => [
      ...prev,
      { sender: "llm", text: "🔍 Your answer is being verified..." },
    ]);

    try {
      await fetch(`${baseUrl}/api/interview/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer, timeTaken }),
      });
    } catch (err) {
      toast.error("❌ Failed to submit answer", { position: "top-right" });
    }

    // continue to next question or finish
    if (questionIndexRef.current < TOTAL_QUESTIONS) {
      // small delay so the "verifying" message is visible
      setTimeout(fetchNextQuestion, 600);
    } else {
      setInterviewStarted(false);
      toast.success("🎉 Thanks for attending!", { position: "top-center" });
    }
  };

  // Loading / eligibility UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center max-w-sm w-full">
          {success ? (
            <p className="text-lg font-semibold text-green-600">
              ✅ Your interview will start in {countdown}s
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-600 mb-4">
                ⚠️ You have already taken the interview
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Go Home
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Chat UI
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <ToastContainer />
      <header className="bg-blue-600 text-white text-center py-3 font-semibold">
        Interview Chat
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-white flex items-center">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type your response..."
          disabled={inputDisabled}
          className="flex-1 border rounded-lg px-3 py-2 text-sm mr-2 disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={inputDisabled}
          className={`px-4 py-2 rounded-lg text-white ${
            inputDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Send
        </button>
      </div>

      {!interviewStarted && questionIndex === TOTAL_QUESTIONS && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          🎉 Thanks for attending!
          <button
            onClick={() => (window.location.href = "/")}
            className="ml-4 bg-white text-green-600 px-3 py-1 rounded"
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}
