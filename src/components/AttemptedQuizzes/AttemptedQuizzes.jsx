import React, { useEffect, useState } from "react";
import { Table, Button, message, Typography, Spin } from "antd";
import { db } from "../../firebase";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // ✅ Import Firebase Auth

const { Title } = Typography;

const AttemptedQuizzes = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // ✅ State to store logged-in user ID
  const navigate = useNavigate();
  const auth = getAuth(); // ✅ Initialize Firebase Auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // ✅ Set logged-in user ID
      } else {
        message.error("User not logged in!");
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchAttemptedQuizzes = async () => {
      try {
        setLoading(true);

        // ✅ Fetch attempts where userId matches logged-in user
        const attemptsRef = collection(db, "attempts");
        const attemptsQuery = query(attemptsRef, where("userId", "==", userId));
        const attemptsSnap = await getDocs(attemptsQuery);

        if (attemptsSnap.empty) {
          message.warning("No attempted quizzes found.");
          setLoading(false);
          return;
        }

        let fetchedAttempts = [];

        // ✅ Fetch quiz names based on quizId
        for (const docSnap of attemptsSnap.docs) {
          const attempt = docSnap.data();
          const quizRef = doc(db, "quizzes", attempt.quizId);
          const quizSnap = await getDoc(quizRef);
          const quizName = quizSnap.exists() ? quizSnap.data().title : "Unknown Quiz"; // Assuming quiz has a "title"

          fetchedAttempts.push({
            key: docSnap.id,
            attemptId: docSnap.id,
            quizName: quizName,
            score: `${attempt.score}`,
            attemptedAt: new Date(attempt.attempted_at.toDate()).toLocaleString(),
          });
        }

        console.log("Fetched Attempts:", fetchedAttempts);
        setAttempts(fetchedAttempts);
      } catch (error) {
        console.error("Error fetching attempted quizzes:", error);
        message.error("Failed to load attempted quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptedQuizzes();
  }, [userId]);

  const columns = [
    {
      title: "Quiz Name",
      dataIndex: "quizName",
      key: "quizName",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Attempted At",
      dataIndex: "attemptedAt",
      key: "attemptedAt",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => navigate(`/view-response/${record.attemptId}`)}>
          View Response
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <Title level={3}>Your Attempted Quizzes</Title>
      <Table columns={columns} dataSource={attempts} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default AttemptedQuizzes;
