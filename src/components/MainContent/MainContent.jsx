import React from "react";
import { Layout } from "antd";
import "./MainContent.css";
import QuizSettings from "../QuizSettings/QuizSettings";
import QuizPage from "../QuizPage/QuizPage";

const { Content } = Layout;

const MainContent = () => (
  <Content className="main-content">
    <h2>Welcome to QuizApp</h2>
    <p>Start your quiz journey now!</p>
    
  </Content>
);

export default MainContent;
