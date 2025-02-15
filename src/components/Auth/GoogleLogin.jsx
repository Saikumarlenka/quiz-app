import React, { useEffect, useState } from "react";
import { auth, provider, db } from "../../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Avatar, Button, Dropdown, Menu, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./GoogleLogin.css";

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);

      // Extract user details
      const { displayName, email, uid, photoURL } = user;
      const nameParts = displayName ? displayName.split(" ") : ["", ""];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[1] : "";

      // Reference to Firestore user document
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          firstName,
          lastName,
          email,
          uid,
          photoURL
        });
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  if (loading) return <Spin className="loading-spinner" />;

  const menu = (
    <Menu>
      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <div className="google-login-container">
      {user ? (
        <div className="user-info">
          <span className="welcome-message">Welcome, {user.displayName}</span>
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Avatar
              src={user.photoURL}
              alt="Profile"
              size={50}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
          </Dropdown>
        </div>
      ) : (
        <Button type="primary" onClick={handleLogin}>Login with Google</Button>
      )}
    </div>
  );
};

export default GoogleLogin;
