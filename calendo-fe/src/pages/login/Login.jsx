import React, { useEffect, useState } from "react";
import "../login/Login.css";
import googleIcon from "../../assets/images/google.svg";

const Login = () => {
  
  const handleLogin = () => {
    // ✅ 프론트에서는 백엔드로 OAuth2 요청을 보냄
    window.location.href = `https://calendo.site/oauth2/authorization/google`;
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
