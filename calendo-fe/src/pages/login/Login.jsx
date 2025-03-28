import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login/Login.css";
import googleIcon from "../../assets/images/google.svg";
import api from "../../utils/api"; // ✅ API 요청 파일

const Login = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = () => {
    // ✅ OAuth 인증 요청을 HTTPS로 설정
    window.location.href = `https://calendo.site/oauth2/authorization/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // ✅ 받은 Access Token

    console.log("🔹 받은 Access Token:", token);

    if (!token || hasRun.current) return;
    hasRun.current = true;

    // ✅ 기존 localStorage 정리
    localStorage.clear(); // 👈 여기가 추가된 부분

    // ✅ 토큰 저장 및 URL 정리
    localStorage.setItem("accessToken", token);
    console.log("🔹 저장된 accessToken:", localStorage.getItem("accessToken"));

    setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);

    // ✅ 사용자 정보 가져오기
    fetchUserData(token);
  }, [navigate]);

  

  const fetchUserData = async (token) => {
    try {
      console.log("🔹 사용자 정보 요청 시작");

      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ 사용자 정보:", response.data);

      // ✅ 사용자 정보를 localStorage에 저장
      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("📌 localStorage에 저장된 user:", localStorage.getItem("user"));

      setUserData(response.data);


      // ✅ 로그인 성공 시 페이지 이동
      navigate("/whole-schedule", { replace: true });
    } catch (error) {
      console.error("❌ 사용자 정보 요청 실패:", error);
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      navigate("/login");
    }
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
