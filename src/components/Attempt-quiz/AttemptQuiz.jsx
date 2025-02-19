import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, message, Progress } from "antd";
import { collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";

const AttemptQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quiz = quizSnap.data();
          const quizTime = parseInt(quiz.time_limit, 10) * 60;
          setTimeLeft(quizTime);

          const questionPromises = quiz.question_ids.map(async (qid) => {
            const questionRef = doc(db, "questions", qid);
            const questionSnap = await getDoc(questionRef);
            if (questionSnap.exists()) {
              const questionData = questionSnap.data();
              return {
                id: qid,
                question: questionData.question,
                options: questionData.options,
                correctOption: questionData.correct_answers, // Store correct answer
              };
            }
            return null;
          });

          const questions = (await Promise.all(questionPromises)).filter(Boolean);
          setQuizData({ ...quiz, questions });

          // Initialize selected answers array with empty selections
          setSelectedAnswers(
            questions.map((q) => ({
              questionId: q.id,
              selectedOption: null,
              correctOption: q.correctOption, // Store correct answer
            }))
          );
        } else {
          message.error("Quiz not found.");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        message.error("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (questionId, selectedOption) => {
    setSelectedAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, selectedOption } : answer
      )
    );
  };

  const handleSubmit = async () => {
    if (!quizData) return;
    
    const user = auth.currentUser;
    if (!user) {
      message.error("User not logged in.");
      return;
    }

    // Calculate score based on correct answers
    let score = selectedAnswers.reduce((acc, ans) => {
      return ans.selectedOption === ans.correctOption ? acc + 1 : acc;
    }, 0);

    const attemptId = `${user.uid}_${quizId}_${Date.now()}`;
    const attemptRef = doc(collection(db, "attempts"), attemptId);

    await setDoc(attemptRef, {
      attemptId,
      quizId,
      userId: user.uid,
      ownerId: quizData.created_by,
      answers: selectedAnswers, // Includes questionId, selectedOption, and correctOption
      score,
      attempted_at: serverTimestamp(),
    });

    navigate(`/scorecard/${attemptId}`);
  };

  return (
    <div>
      <h2>Attempt Quiz</h2>
      <Progress
        percent={(timeLeft / (quizData?.time_limit * 60)) * 100}
        status="active"
        showInfo={false}
      />
      <h3>
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        quizData?.questions?.map((q) => (
          <Card key={q.id} title={q.question}>
            <style jsx>{`
              .option-box {
                display: flex;
                flex-direction: column;
              }
              .option {
                padding: 10px;
                margin: 5px 0;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
              }
              .option.selected {
                background-color: rgb(103, 191, 231);
                border-color: rgb(1, 44, 71);
              }
            `}</style>
            <div className="option-box">
              {q.options.map((opt) => (
                <div
                  key={opt}
                  className={`option ${
                    selectedAnswers.find((ans) => ans.questionId === q.id)?.selectedOption === opt
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(q.id, opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      <Button type="primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: "20px" }}>
        Submit Quiz
      </Button>
    </div>
  );
};

export default AttemptQuiz;
