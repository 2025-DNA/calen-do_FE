import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // 🔥 Axios 인스턴스
import "../login/Login.css";
import googleIcon from "../../assets/images/google.svg";

const Login = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
  
    if (token) {
      localStorage.setItem("access_token", token);
      console.log("✅ JWT 저장 완료:", token);
      navigate("/whole-schedule");
    }
  }, []);
  

  const handleLogin = () => {
    // ✅ 프론트에서는 백엔드로 OAuth2 요청을 보냄
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
  };
  

  return (
    <div className="login-container">
      <h2 className="login-title">
        당신의 일정을 한눈에
        <br />
        캘린두 📅
      </h2>
      <p className="login-subtitle">
        일정과 to-do list를 한번에 관리하는 편리함 <br />
        캘린두에서는 유캔두잇 <br />
        환영해요!
      </p>

      <hr className="divider" />

      <div className="google-login-container" onClick={handleLogin}>
        <p className="google-login-text">구글 자동 로그인</p>
        <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
      </div>
    </div>
  );
};

export default Login;
