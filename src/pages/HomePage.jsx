import React, { useState } from "react";
import { Layout } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import NavBar from "../components/Header/NavBar";
import MainContent from "../components/MainContent/MainContent";
import QuizPage from "../components/QuizPage/QuizPage";
import QuizSettings from "../components/QuizSettings/QuizSettings";
import QuizFetcher from "../gemini/QuizFetcher";
import AllQuizzes from "../components/All-quizes/AllQuizzes";
import AttemptQuiz from "../components/Attempt-quiz/AttemptQuiz";
import ScoreCard from "../components/Attempt-quiz/ScoreCard";
import Responses from "../components/Response/Response";
import ViewResponse from "../components/Response/ViewResponse";
import AttemptedQuizzes from "../components/AttemptedQuizzes/AttemptedQuizzes";
import { useAuth } from "../context/UserContext";
import Login from "../components/Login/Login";

const { Content } = Layout;

const Home = () => {
  const ProtectedRoute = ({ element }) => {
    const { user, loading } = useAuth();

    if (loading) return <Spin />;

    return user ? element : <Navigate to="/login" />;
  };

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Layout className="site-layout">
          <NavBar />
          <Content className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/all-quizzes" />} />
              <Route
                path="/all-quizzes"
                element={<ProtectedRoute element={<AllQuizzes />} />}
              />
              <Route
                path="/attempt-quiz/:quizId"
                element={<ProtectedRoute element={<AttemptQuiz />} />}
              />
              <Route
                path="/scorecard/:attemptId"
                element={<ProtectedRoute element={<ScoreCard />} />}
              />
              <Route
                path="/quiz-responses/:quizId"
                element={<ProtectedRoute element={<Responses />} />}
              />
              <Route
                path="/view-response/:attemptId"
                element={<ProtectedRoute element={<ViewResponse />} />}
              />
              <Route
                path="/attempted-quizzes"
                element={<ProtectedRoute element={<AttemptedQuizzes />} />}
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default Home;
