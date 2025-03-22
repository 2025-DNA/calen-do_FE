import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 URL에서 쿼리스트링 추출
    const queryParams = new URLSearchParams(window.location.search);
    const authCode = queryParams.get("code");

    if (!authCode) {
      console.error("❌ 인증 코드가 없습니다.");
      navigate("/login"); // 로그인 페이지로 리디렉트
      return;
    }

    console.log("✅ 받은 인증 코드:", authCode);

    // 백엔드에 인증 코드 전달하여 JWT 토큰 요청
    fetch("http://localhost:8080/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: authCode }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`로그인 요청 실패: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ 로그인 성공, 받은 데이터:", data);

        if (data.accessToken) {
          localStorage.setItem("access_token", data.accessToken); // JWT 저장
          localStorage.setItem("user", JSON.stringify(data.user)); // 사용자 정보 저장
          navigate("/"); // 메인 페이지로 이동
        } else {
          console.error("❌ 토큰이 없습니다:", data);
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("🚨 로그인 처리 오류:", error);
        navigate("/login");
      });
  }, [navigate]);

  return <div>🔄 로그인 처리 중...</div>;
};

export default OAuthCallback;
