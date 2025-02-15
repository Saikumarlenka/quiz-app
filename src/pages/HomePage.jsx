import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "../components/SideBar/SideBar";
import NavBar from "../components/Header/NavBar";
import MainContent from "../components/MainContent/MainContent";
import QuizPage from "../components/QuizPage/QuizPage";
import QuizSettings from "../components/QuizSettings/QuizSettings";
import QuizFetcher from "../gemini/QuizFetcher";

const { Content } = Layout;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", minWidth:'100vw' }} >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className="site-layout">
        <NavBar />
        <Content className="main-content">
          {/* <MainContent /> */}
          {/* <QuizFetcher /> */}
          <QuizSettings />
          {/* <QuizPage /> */}

        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
