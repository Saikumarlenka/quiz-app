import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Typography, Button } from "antd";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

const { Title, Text } = Typography;

const ViewResponse = () => {
  const { attemptId } = useParams();
  const [attemptData, setAttemptData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        // Fetch attempt details
        const attemptRef = doc(db, "attempts", attemptId);
        const attemptSnap = await getDoc(attemptRef);

        if (!attemptSnap.exists()) {
          message.error("Attempt not found.");
          return;
        }

        const attempt = attemptSnap.data();
        setAttemptData(attempt);

        // Fetch quiz details
        const quizRef = doc(db, "quizzes", attempt.quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          message.error("Quiz not found.");
          return;
        }

        const quiz = quizSnap.data();
        setQuizData(quiz);

        // Fetch all related questions
        const questionIds = Object.keys(attempt.answers); // Extract question IDs from answers map
        const questionsCollection = collection(db, "questions");
        const questionsQuery = query(questionsCollection, where("__name__", "in", questionIds));
        const questionSnapshots = await getDocs(questionsQuery);

        const fetchedQuestions = questionSnapshots.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching response:", error);
        message.error("Failed to load response.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!attemptData || !quizData || questions.length === 0) {
    return <p style={{ textAlign: "center" }}>No data found.</p>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <Card title="Attempted Quiz Response" bordered>
        <Title level={3}>Your Score: {attemptData.score} / {questions.length}</Title>
        
        {questions.map((question, index) => {
          const selectedAnswer = attemptData.answers[question.id]; // User's selected answer
          const correctAnswers = question.correct_answers || [];

          return (
            <Card
              key={index}
              title={`Question ${index + 1}`}
              style={{ marginBottom: "20px", background: "#fafafa" }}
            >
              <Text strong>{question.question}</Text>

              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {question.options.map((option, idx) => {
                  const isCorrect = correctAnswers.includes(option);
                  const isSelected = selectedAnswer === option;

                  return (
                    <Button
                      key={idx}
                      type="text"
                      style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        background: isCorrect ? "#b7eb8f" : isSelected ? "#ffa39e" : "#f5f5f5",
                        color: isCorrect || isSelected ? "#000" : "#000",
                        border: "1px solid #d9d9d9",
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </Card>
    </div>
  );
};

export default ViewResponse;
