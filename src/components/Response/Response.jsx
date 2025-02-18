import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, message, Card, Button } from "antd";
import { auth, db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const Responses = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          message.error("User not logged in.");
          return;
        }

        // Fetch quiz details to check if the user is the creator & get total questions
        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          if (quizData.created_by === user.uid) {
            setIsCreator(true);
          }
          setTotalQuestions(quizData.num_of_questions || 0);
        } else {
          message.error("Quiz not found.");
          return;
        }

        // Fetch all attempts related to this quizId
        const attemptsRef = collection(db, "attempts");
        const attemptsSnap = await getDocs(attemptsRef);

        const attemptsList = [];
        let index = 1; // Row number
        for (const docSnap of attemptsSnap.docs) {
          const attemptData = docSnap.data();
          if (attemptData.quizId === quizId) {
            // Fetch user details from Firestore
            const userRef = doc(db, "users", attemptData.userId);
            const userSnap = await getDoc(userRef);
            let userInfo = { firstName: "Unknown", lastName: "" };

            if (userSnap.exists()) {
              const userData = userSnap.data();
              userInfo = {
                firstName: userData.firstName || "Unknown",
                lastName: userData.lastName || "",
              };
            }

            attemptsList.push({
              key: index++, // Row number
              attemptId: docSnap.id,
              ...attemptData,
              ...userInfo, // Merge user details
            });
          }
        }

        setResponses(attemptsList);
      } catch (error) {
        console.error("Error fetching responses:", error);
        message.error("Failed to load responses.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (score) => `${score} / ${totalQuestions}`,
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "Attempted At",
      dataIndex: "attempted_at",
      key: "attempted_at",
      render: (timestamp) => new Date(timestamp.seconds * 1000).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => navigate(`/view-response/${record.attemptId}`)}>
          View Attempt
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Card title="Quiz Responses" style={{ maxWidth: "900px", margin: "auto" }}>
        {isCreator ? (
          <Table
            dataSource={responses}
            columns={columns}
            loading={loading}
            rowKey="key"
            bordered
          />
        ) : (
          <p>You are not the creator of this quiz. No responses to show.</p>
        )}
      </Card>
    </div>
  );
};

export default Responses;
