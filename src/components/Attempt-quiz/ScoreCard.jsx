import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, message } from "antd";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const ScoreCard = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const attemptRef = doc(db, "attempts", attemptId);
        const attemptSnap = await getDoc(attemptRef);

        if (attemptSnap.exists()) {
          setAttemptData(attemptSnap.data());
        } else {
          message.error("Attempt not found.");
        }
      } catch (error) {
        console.error("Error fetching attempt:", error);
        message.error("Failed to load attempt details.");
      }
    };

    fetchAttempt();
  }, [attemptId]);

  // Calculate total questions and 80% passing score
  const totalQuestions = attemptData?.answers ? Object.keys(attemptData.answers).length : 0;
  const passingScore = Math.ceil(totalQuestions * 0.8); // 80% of total marks

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* Confetti effect triggers when score is 80% or more */}
      {attemptData?.score >= passingScore && <Confetti width={width} height={height} />}
      
      <Card title="Quiz Scorecard" style={{ maxWidth: 400, margin: "auto", borderRadius: "10px" }}>
        <h3>Your Score: {attemptData?.score} / {totalQuestions}</h3>

        {attemptData?.score >= passingScore ? (
          <p style={{ fontSize: "18px", color: "#52c41a" }}>🎉 Amazing! You're a quiz master! 🎉</p>
        ) : (
          <p style={{ fontSize: "18px", color: "#ff4d4f" }}>Keep trying! You'll get there. 💪</p>
        )}

        <Button type="primary" onClick={() => navigate("/all-quizzes")}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default ScoreCard;
