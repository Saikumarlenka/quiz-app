import React from "react";
import { Card, Button, Typography, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate , useLocation} from "react-router-dom";
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/all-quizzes";

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      message.success("Logged in successfully!");
      navigate(from, { replace: true }); 
    } catch (error) {
      console.error("Login Failed:", error);
      message.error("Failed to login!");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f0f2f5"
    }}>
      <div style={{ width: 600, textAlign: "center", borderRadius: "10px", height: 600}} className="login-card">
        <h1 >Quiz App</h1>
        <Text type="primary" className="text">Login to access the content</Text>
        <div style={{ marginTop: "20px" }}>
          <Button type="primary" size="large" icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
