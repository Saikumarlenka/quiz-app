import React from "react";
import { Layout, Menu } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import './SideBar.css'

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => (
  <Sider trigger={null} collapsible collapsed={collapsed} className="sidebar">
    <div className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
      {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    </div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
    </Menu>
  </Sider>
);

export default Sidebar;
