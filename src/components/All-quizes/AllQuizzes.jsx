import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Spin, Modal } from "antd";
import { collection, getDocs, orderBy, query, where, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../../context/UserContext"; // ✅ Import Auth Hook
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
  const [deleteloader, setDeleteLoader] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Get current logged-in user

  useEffect(() => {
    if (!user) return;
     // Ensure user is logged in

    const fetchQuizzes = async () => {
      
      
      try {
        setLoading(true);
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("created_by", "==", user.uid)); // ✅ Filter by logged-in user
        const querySnapshot = await getDocs(q);

        const quizzesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate().toLocaleString(),
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
  }, [user]); // ✅ Fetch when user changes

  const handleAttempt = (quizId) => {
    navigate(`/attempt-quiz/${quizId}`);
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
  };

  const handleDelete = async (quizId) => {
    try {
      setDeleteLoader(true);
      const quizRef = doc(db, "quizzes", quizId);
      await deleteDoc(quizRef);

      message.success("Quiz deleted successfully!");
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      message.error("Failed to delete quiz.");
    } finally {
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
          <Button type="primary" icon={<FormOutlined />} onClick={() => handleAttempt(record.id)}>
            Attempt
          </Button>
          <Button type="default" icon={<BarChartOutlined />} onClick={() => handleResponses(record.id)}>
            Responses
          </Button>
          <Button type="dashed" icon={<ShareAltOutlined />} onClick={() => handleShare(record.id)}>
            Share
          </Button>
          <Button
            loading={deleteloader}
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteConfirm(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
       {/* ✅ Add user check if not show a antd model with login with button and functionality */
         !user &&
          <Modal>
            <Button>Login with Google</Button>
          </Modal>
       }
      
      <div className="header">
        <h2>My Quizzes</h2>
        <Button type="primary" onClick={() => navigate("/quiz-settings")}>
          Create Quiz
        </Button>
      </div>
      {loading ? (
        <div className="loader-container">
          <Spin size="large" />
        </div>
      ) : (
        <Table columns={columns} dataSource={quizzes} rowKey="id" pagination={{ pageSize: 10 }} />
      )}
    </div>
  );
};

export default AllQuizzes;
