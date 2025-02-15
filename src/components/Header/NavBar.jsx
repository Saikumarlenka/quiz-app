import React from "react";
import { Layout } from "antd";
import  './NavBar.css'
import GoogleLogin from "../Auth/GoogleLogin";

const { Header } = Layout;

const NavBar = () => (
  <Header className="header-navbar">
    <h1 className="app-title">QuizApp</h1>
    <GoogleLogin />
     
  </Header>
);

export default NavBar;
