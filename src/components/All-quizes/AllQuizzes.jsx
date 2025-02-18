import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Spin, Modal } from "antd";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  ShareAltOutlined,
  FormOutlined,
  BarChartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./AllQuizzes.css";

const AllQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptloader, setAttemptLoader] = useState(false);
  const [responsesloader, setResponsesLoader] = useState(false);
  const [shareloader, setShareLoader] = useState(false);
  const [deleteloader, setDeleteLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, orderBy("created_at", "desc")); // Sorting by most recent
        const querySnapshot = await getDocs(q);

        const quizzesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate().toLocaleString(), // Formatting date
        }));

        setQuizzes(quizzesList);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        message.error("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleAttempt = (quizId) => {
    try {
        setAttemptLoader(true);
        navigate(`/attempt-quiz/${quizId}`);
        
    } catch (error) {
        
    }
    finally{
        setAttemptLoader(false);
    }
    
  };

  const handleResponses = (quizId) => {
    navigate(`/quiz-responses/${quizId}`);
  };

  const handleShare = (quizId) => {
    const quizLink = `${window.location.origin}/attempt-quiz/${quizId}`;
    navigator.clipboard.writeText(quizLink);
    message.success("Quiz link copied to clipboard!");
  };

  const handleDeleteConfirm = (quizId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this quiz?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(quizId),
    });
    console.log("Delete quiz with ID:", quizId);
    
  };

  const handleDelete = async (quizId) => {
    try {
        setDeleteLoader(true);
      // Reference to the quiz document
      const quizRef = doc(db, "quizzes", quizId);

      // Fetch the quiz document to get question IDs
      const quizSnapshot = await getDocs(query(collection(db, "quizzes"), where("__name__", "==", quizId)));
      if (!quizSnapshot.empty) {
        const quizData = quizSnapshot.docs[0].data();
        const questionIds = quizData.questions || []; // Array of question IDs

        // Delete each question from the "questions" collection
        const deleteQuestionPromises = questionIds.map(async (questionId) => {
          const questionRef = doc(db, "questions", questionId);
          await deleteDoc(questionRef);
        });

        await Promise.all(deleteQuestionPromises); // Wait for all deletions
      }

      // Delete the quiz document
      await deleteDoc(quizRef);

      message.success("Quiz and related questions deleted successfully!");

      // Refresh the quiz list
      setQuizzes((prevQuizzes) =>
        prevQuizzes.filter((quiz) => quiz.id !== quizId)
      );
    } catch (error) {
      console.error("Error deleting quiz:", error);
      message.error("Failed to delete quiz.");
    }
    finally{
        setDeleteLoader(false);
    }
  };

  const columns = [
    {
      title: "Concept",
      dataIndex: "concept",
      key: "concept",
      sorter: (a, b) => a.concept.localeCompare(b.concept),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty",
      filters: [
        { text: "Easy", value: "easy" },
        { text: "Medium", value: "medium" },
        { text: "Hard", value: "hard" },
      ],
      onFilter: (value, record) => record.difficulty_level === value,
    },
    {
      title: "No. of Questions",
      dataIndex: "num_of_questions",
      key: "num_of_questions",
      sorter: (a, b) => a.num_of_questions - b.num_of_questions,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => handleAttempt(record.id)}
          >
            Attempt
          </Button>
          <Button
            type="default"
            icon={<BarChartOutlined />}
            onClick={() => handleResponses(record.id)}
          >
            Responses
          </Button>
          <Button
            type="dashed"
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(record.id)}
          >
            Share
          </Button>
          <Button
            loading={deleteloader}
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
        <div className="header">
        <h2>All Quizzes</h2>
    <Button type="primary" onClick={() => navigate("/quiz-settings")}>
      Create Quiz
    </Button>
        </div>
   
    {loading ? (
      <div className="loader-container">
        <Spin size="large" />
      </div>
    ) : (
      <Table
        columns={columns}
        dataSource={quizzes}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        responsive
      />
    )}
  </div>
  );
};

export default AllQuizzes;
