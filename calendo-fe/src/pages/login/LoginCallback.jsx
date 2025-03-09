import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LoginCallback = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    console.log("🔹 받은 토큰:", token); 

    if (token) {
      localStorage.setItem("accessToken", token); //토큰 저장
      alert("로그인 성공! 메인 페이지로 이동합니다.");
      
      // ✅ 보안 강화를 위해 URL에서 `token` 제거
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);

      navigate("/whole-schedule", { replace: true });
    } else {
      alert("로그인 실패! 다시 시도해주세요.");
      navigate("/login");
    }
  }, [navigate]); 

  return <div>로그인 중...</div>;
};

export default LoginCallback;
