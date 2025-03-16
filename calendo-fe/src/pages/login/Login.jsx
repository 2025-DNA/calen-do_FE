// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// import '../login/Login.css';
// import googleIcon from "../../assets/images/google.svg";

// const Login = () => {
//   const navigate = useNavigate();

  // const handleGoogleLogin = () => {
  //   // 🔥 OAuth2 로그인 요청 (리디렉트 방식)
  //   window.location.href = "/oauth2/authorization/google";
  // };


  // const handleLogin = () => {
  //   // 구글 로그인 화면으로 이동시키기
  //   window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?
	// 	client_id=${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}
	// 	&redirect_uri=${process.env.REACT_APP_GOOGLE_AUTH_REDIRECT_URI}
	// 	&response_type=code
	// 	&scope=email profile`;
  // };

  // const handleGoogleLogin = async () => {
  //   try {
  //     const response = await fetch("/oauth2/authorization/google", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ provider: "google" }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("로그인 실패");
  //     }
      
  //     const userData = await response.json();
  //     const userEmail = userData.email;
  //     const nickname = userEmail.split("@")[0]; // @ 앞부분 추출
  //     const userId = userData.id;

  //     // ✅ 닉네임 설정 요청 (PUT)
  //     await fetch(`/api/users/check-nickname?nickname=${nickname}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" }
  //     });

  //     // ✅ 사용자 정보 `localStorage`에 저장
  //     localStorage.setItem("email", userEmail); // **수정됨**
  //     localStorage.setItem("nickname", nickname);
  //     localStorage.setItem("userId", userId); // ✅ userId도 저장


  //     navigate("/whole-schedule"); // 로그인 성공 시 일정 페이지로 이동
  //   } catch (error) {
  //     console.error("로그인 오류:", error);
  //     alert("로그인에 실패했습니다.");
  //   }
  // };

//   const handleGoogleLogin = async () => {
//     try {
//       const response = await fetch("/oauth2/authorization/google", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!response.ok) {
//         throw new Error("로그인 실패");
//       }

//       const data = await response.json();
//       localStorage.setItem("access_token", data.access_token);
//       const userEmail = data.email;
//       const nickname = userEmail.split("@")[0];

//       // 닉네임 설정
//       await fetch(`/api/users/check-nickname?nickname=${nickname}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${data.access_token}`,
//         },
//       });

//       localStorage.setItem("email", userEmail);
//       localStorage.setItem("nickname", nickname);
//       localStorage.setItem("userId", data.id);

//       navigate("/whole-schedule");
//     } catch (error) {
//       console.error("로그인 오류:", error);
//       alert("로그인에 실패했습니다.");
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2 className="login-title">당신의 일정을 한눈에<br />캘린두 📅</h2>
//       <p className="login-subtitle">
//         일정과 to-do list를 한번에 관리하는 편리함 <br />
//         캘린두에서는 유캔두잇 <br />
//         환영해요!
//       </p>
      
//       <hr className="divider" />
      
//       <div className="google-login-container" onClick={handleGoogleLogin}>
//       <p className="google-login-text">구글 자동 로그인</p>
//       <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
        
//       </div>
//     </div>
//   );
// };

// export default Login;

// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../login/Login.css";
// import googleIcon from "../../assets/images/google.svg";
// import api from "../../utils/api"

// const Login = () => {
//   const navigate = useNavigate();
//   const hasRun = useRef(false);
//   const [userData, setUserData] = useState(null);

//   const handleLogin = () => {
//     window.location.href = `https://calendo.site/oauth2/authorization/google`;
//   };

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get("token");
//     const refreshToken = urlParams.get("refreshToken"); 


//     if (!token || hasRun.current) return;
//     hasRun.current = true;

//     console.log("🔹 받은 Access Token:", token);
//     console.log("🔹 받은 Refresh Token:", refreshToken);

//     if (token && refreshToken) {
//       localStorage.setItem("accessToken", token);
//       localStorage.setItem("refreshToken", refreshToken); // ✅ Refresh Token 저장
//       console.log("🔹 저장된 accessToken:", localStorage.getItem("accessToken"));

//       alert("로그인 성공! 메인 페이지로 이동합니다.");

//       setTimeout(() => {
//         window.history.replaceState({}, document.title, window.location.pathname);
//       }, 500);

//       navigate("/whole-schedule", { replace: true });
//     } else {
//       alert("로그인 실패! 다시 시도해주세요.");
//       navigate("/login");
//     }
//   }, [navigate]);

//   // ✅ 사용자 정보 가져오기
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         console.log("🔹 사용자 정보 요청 시작");

//         const response = await api.get("/users/me"); // ✅ api.js를 사용하여 요청
//         console.log("✅ 사용자 정보:", response.data);
//         setUserData(response.data);
//       } catch (error) {
//         console.error("❌ 사용자 정보 요청 실패:", error);
//       }
//     };

//     fetchUserData();
//   }, []);


//   return (
//     <div className="login-container">
//       <h2 className="login-title">
//         당신의 일정을 한눈에
//         <br />
//         캘린두 📅
//       </h2>
//       <p className="login-subtitle">
//         일정과 to-do list를 한번에 관리하는 편리함 <br />
//         캘린두에서는 유캔두잇 <br />
//         환영해요!
//       </p>

//       <hr className="divider" />

//       <div className="google-login-container" onClick={handleLogin}>
//         <p className="google-login-text">구글 자동 로그인</p>
//         <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
//       </div>

//       {/* 사용자 정보 표시 */}
//       {userData && (
//         <div>
//           <h3>환영합니다, {userData.name}님!</h3>
//           <p>Email: {userData.email}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../login/Login.css";
// import googleIcon from "../../assets/images/google.svg";
// import api from "../../utils/api";  // ✅ api.js 사용

// const Login = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);

//   const handleLogin = () => {
//     window.location.href = `https://calendo.site/oauth2/authorization/google`;
//   };

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         console.log("🔹 사용자 정보 요청 시작");

//         const response = await api.get("/users/me");  // ✅ api.js 사용
//         console.log("✅ 사용자 정보:", response.data);
//         setUserData(response.data);
//       } catch (error) {
//         console.error("❌ 사용자 정보 요청 실패:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   return (
//     <div className="login-container">
//       <h2 className="login-title">
//         당신의 일정을 한눈에
//         <br />
//         캘린두 📅
//       </h2>
//       <p className="login-subtitle">
//         일정과 to-do list를 한번에 관리하는 편리함 <br />
//         캘린두에서는 유캔두잇 <br />
//         환영해요!
//       </p>

//       <hr className="divider" />

//       <div className="google-login-container" onClick={handleLogin}>
//         <p className="google-login-text">구글 자동 로그인</p>
//         <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
//       </div>

//       {/* 사용자 정보 표시 */}
//       {userData && (
//         <div>
//           <h3>환영합니다, {userData.name}님!</h3>
//           <p>Email: {userData.email}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../login/Login.css";
// import googleIcon from "../../assets/images/google.svg";
// import api from "../../utils/api"; // ✅ API 요청을 위한 axios 인스턴스 사용

// const Login = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);

  
//   // 🔹 로그인 버튼 클릭 시 Google OAuth 요청
//   const handleLogin = () => {
//     window.location.href = `https://calendo.site/oauth2/authorization/google`;
//   };

//   // 🔹 URL에 token과 refreshToken이 있는지 확인 후 처리
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get("token");
//     const refreshToken = urlParams.get("refreshToken");

//     if (token && refreshToken) {
//       console.log("🔹 받은 Access Token:", token);
//       console.log("🔹 받은 Refresh Token:", refreshToken);

//       // ✅ 토큰 저장
//       localStorage.setItem("accessToken", token);
//       localStorage.setItem("refreshToken", refreshToken);

//       // ✅ URL에서 토큰 삭제 (보안상 필요)
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   // 🔹 사용자 정보 요청
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         console.log("🔹 사용자 정보 요청 시작");
//         const response = await api.get("/users/me"); // ✅ 저장된 토큰으로 요청
//         console.log("✅ 사용자 정보:", response.data);
//         setUserData(response.data);
//         localStorage.setItem("user", JSON.stringify(response.data)); // ✅ 사용자 정보 저장

//         // ✅ 로그인 성공 시 전체 일정 페이지로 이동
//         navigate("/whole-schedule", { replace: true });
//       } catch (error) {
//         console.error("❌ 사용자 정보 요청 실패:", error);
//         alert("사용자 정보를 불러올 수 없습니다.");
//       }
//     };

//     // ✅ 토큰이 있으면 사용자 정보 요청
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       fetchUserData();
//     }
//   }, [navigate]);

//   return (
//     <div className="login-container">
//       <h2 className="login-title">
//         당신의 일정을 한눈에
//         <br />
//         캘린두 📅
//       </h2>
//       <p className="login-subtitle">
//         일정과 to-do list를 한번에 관리하는 편리함 <br />
//         캘린두에서는 유캔두잇 <br />
//         환영해요!
//       </p>

//       <hr className="divider" />

//       <div className="google-login-container" onClick={handleLogin}>
//         <p className="google-login-text">구글 자동 로그인</p>
//         <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
//       </div>

//       {/* 사용자 정보 표시 */}
//       {userData && (
//         <div>
//           <h3>환영합니다, {userData.name}님!</h3>
//           <p>Email: {userData.email}</p>
//           <img src={userData.picture} alt="프로필 이미지" width="100" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../login/Login.css";
// import googleIcon from "../../assets/images/google.svg";
// import api from "../../utils/api"; // ✅ API 요청을 위한 axios 인스턴스 사용

// const Login = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);

//   // 🔹 로그인 버튼 클릭 시 Google OAuth 요청
//   const handleLogin = () => {
//     window.location.href = `https://calendo.site/oauth2/authorization/google`;
//   };

//   // 🔹 URL에 token과 refreshToken이 있는지 확인 후 처리
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get("token");
//     const refreshToken = urlParams.get("refreshToken");

//     if (token && refreshToken) {
//       console.log("🔹 받은 Access Token:", token);
//       console.log("🔹 받은 Refresh Token:", refreshToken);

//       // ✅ 토큰 저장
//       localStorage.setItem("accessToken", token);
//       localStorage.setItem("refreshToken", refreshToken);

//       // ✅ URL에서 토큰 삭제 (보안상 필요)
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   // 🔹 사용자 정보 요청
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         console.log("🔹 사용자 정보 요청 시작");
//         const response = await api.get("/users/me"); // ✅ 저장된 토큰으로 요청
//         console.log("✅ 사용자 정보:", response.data);
//         setUserData(response.data);
//         localStorage.setItem("user", JSON.stringify(response.data)); // ✅ 사용자 정보 저장

//         // ✅ 로그인 성공 시 전체 일정 페이지로 이동
//         navigate("/whole-schedule", { replace: true });
//       } catch (error) {
//         console.error("❌ 사용자 정보 요청 실패:", error);
//         alert("사용자 정보를 불러올 수 없습니다.");
//       }
//     };

//     // ✅ 토큰이 있으면 사용자 정보 요청
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       fetchUserData();
//     }
//   }, [navigate]);

//   return (
//     <div className="login-container">
//       <h2 className="login-title">
//         당신의 일정을 한눈에
//         <br />
//         캘린두 📅
//       </h2>
//       <p className="login-subtitle">
//         일정과 to-do list를 한번에 관리하는 편리함 <br />
//         캘린두에서는 유캔두잇 <br />
//         환영해요!
//       </p>

//       <hr className="divider" />

//       <div className="google-login-container" onClick={handleLogin}>
//         <p className="google-login-text">구글 자동 로그인</p>
//         <img src={googleIcon} alt="Google 로그인" className="google-login-button" />
//       </div>

//       {/* 사용자 정보 표시 */}
//       {userData && (
//         <div>
//           <h3>환영합니다, {userData.name}님!</h3>
//           <p>Email: {userData.email}</p>
//           <img src={userData.picture} alt="프로필 이미지" width="100" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;
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

      {/* 사용자 정보 표시 */}
      {userData && (
        <div>
          <h3>환영합니다, {userData.name}님!</h3>
          <p>Email: {userData.email}</p>
        </div>
      )}
    </div>
  );
};

export default Login;
