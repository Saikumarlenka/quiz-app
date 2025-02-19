import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Typography, Button , Collapse } from "antd";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { run1 } from "../../gemini/aiinstructions";

const { Title, Text } = Typography;

const ViewResponse = () => {
  const { attemptId } = useParams();
  const [attemptData, setAttemptData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({}); 
  const [fetchingExplanation, setFetchingExplanation] = useState({}); 

  const fetchExplanation = async (questionId,question, selected, correct) => {
    if (fetchingExplanation[questionId]) return; // Prevent duplicate fetches
    console.log(`Fetching explanation for questionId: ${questionId}`);
    console.log(`Selected: ${selected}, Correct: ${correct}`);
    
    

    setFetchingExplanation((prev) => ({ ...prev, [questionId]: true }));

    try {
      const inputContent = `Question: ${question}Selected: ${selected}, Correct: ${correct}`;
      const response = await run1(inputContent);
      setExplanations((prev) => ({ ...prev, [questionId]: response }));
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanations((prev) => ({ ...prev, [questionId]: "Failed to fetch explanation." }));
    } finally {
      setFetchingExplanation((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching attempt data for attemptId: ${attemptId}`);

        //  Fetch attempt details
        const attemptRef = doc(db, "attempts", attemptId);
        const attemptSnap = await getDoc(attemptRef);

        if (!attemptSnap.exists()) {
          message.error("Attempt not found.");
          setLoading(false);
          return;
        }

        const attempt = attemptSnap.data();
        console.log(" Attempt Data:", attempt);
        setAttemptData(attempt);

        //  Fetch quiz details
        console.log(`Fetching quiz data for quizId: ${attempt.quizId}`);
        const quizRef = doc(db, "quizzes", attempt.quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          message.error("Quiz not found.");
          setLoading(false);
          return;
        }

        const quiz = quizSnap.data();
        console.log(" Quiz Data:", quiz);
        setQuizData(quiz);

        // Fetch questions using Firestore IDs
        const quizQuestionIds = quiz.question_ids || [];
        if (quizQuestionIds.length === 0) {
          message.error("No questions found for this quiz.");
          setLoading(false);
          return;
        }

        let fetchedQuestions = [];
        for (let i = 0; i < quizQuestionIds.length; i += 10) {
          const batchIds = quizQuestionIds.slice(i, i + 10);
          const questionsCollection = collection(db, "questions");
          const questionsQuery = query(questionsCollection, where("__name__", "in", batchIds));
          const questionSnapshots = await getDocs(questionsQuery);

          fetchedQuestions = [
            ...fetchedQuestions,
            ...questionSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          ];
        }

        console.log("Fetched Questions:", fetchedQuestions);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error(" Error fetching response:", error);
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
  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const items=[
  {
    key: '1',
    label: 'Explination',
    children: <p>{text}</p>,
  },
  

]


  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px",  }}>
      
      <Card title="Attempted Quiz Response" variant="normal">
        <Title level={3}>Your Score: {attemptData.score} / {questions.length}</Title>
        
        {questions.map((question, index) => {
          const answerData = attemptData.answers.find((ans) => ans.questionId === question.questionId);
          const selectedAnswer = answerData?.selectedOption || null;
          const correctAnswer = answerData?.correctOption || null;

          console.log(` Question ${index + 1}:`, {
            questionText: question.question,
            selectedAnswer,
            correctAnswer,
          });

          return (
            <Card
              key={index}
              title={`Question ${index + 1}`}
              style={{ marginBottom: "20px", background: "#fafafa" }}
            >
              <Text strong>{question.question}</Text>

              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {question.options.map((option, idx) => {
                  const isCorrect = option === correctAnswer;
                  const isSelected = option === selectedAnswer;

                  let backgroundColor = "#f5f5f5";
                  let borderColor = "#d9d9d9";
                  let fontWeight = "normal";

                  if (isSelected) {
                    if (isCorrect) {
                      backgroundColor = "#b7eb8f"; 
                      borderColor = "#52c41a";
                      fontWeight = "bold";
                    } else {
                      backgroundColor = "#ffa39e"; 
                      borderColor = "#ff4d4f";
                    }
                  } else if (isCorrect) {
                    backgroundColor = "#b7eb8f"; 
                    borderColor = "#52c41a";
                    fontWeight = "bold";
                  }

                  console.log(
                    ` Option: ${option} | Selected: ${isSelected} | Correct: ${isCorrect}`
                  );

                  return (
                    <Button
                      key={idx}
                      type="text"
                      style={{
                        padding: "10px 15px",
                        borderRadius: "8px",
                        fontWeight,
                        background: backgroundColor,
                        color: "#000",
                        border: `1px solid ${borderColor}`,
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
              
              <Collapse style={{ marginTop: "10px" }}
                items={[
                  {
                    key: "1",
                    label: "Explanation",
                    children: (
                      <p>
                        {fetchingExplanation[question.questionId] ? (
                          <Spin size="small" />
                        ) : (
                          explanations[question.questionId] || "Click to fetch explanation."
                        )}
                      </p>
                    ),
                    onClick: () => fetchExplanation(question.questionId, question.question, selectedAnswer, correctAnswer),
                  },
                ]}
              />

            </Card>
          )
        })}
      </Card>
    </div>
  );
};

export default ViewResponse;
