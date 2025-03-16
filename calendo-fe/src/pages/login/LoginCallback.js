// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/api";

// const LoginCallback = () => {
//   const navigate = useNavigate();
//   const hasRun = useRef(false);
//   const [user, setUser] = useState(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);

//   useEffect(() => {
//     if (hasRun.current) return;
//     hasRun.current = true;

//     const urlParams = new URLSearchParams(window.location.search);
//     let token = urlParams.get("token");

//     console.log("받은 토큰:", token);

//     if (token) {
//       try {
//         // 토큰이 JSON 형태인지 확인 후 저장
//         const parsedToken = JSON.parse(token);
//         if (parsedToken.access_token) {
//           token = parsedToken.access_token;
//         }
//       } catch (error) {
//         // JSON 파싱 에러 발생 시, token은 그대로 사용
//       }

//       localStorage.setItem("accessToken", token);
//       window.history.replaceState({}, document.title, window.location.pathname);

//       // ✅ 사용자 정보 가져와서 로컬스토리지에 저장
//       const fetchUserData = async () => {
//         try {
//           const response = await api.get(`/api/users/me`, {
//             headers: { Authorization: `Bearer ${token}` }, // 🔥 토큰을 포함하여 요청
//           });
//           console.log("✅ 사용자 정보:", response.data);

//           // ✅ 사용자 정보를 localStorage에 저장
//           localStorage.setItem("user", JSON.stringify(response.data));
//           setUser(response.data);

//           // 로그인 성공 후 페이지 이동
//           setTimeout(() => {
//             navigate("/whole-schedule", { replace: true });
//           }, 1000);
//         } catch (error) {
//           if (error.response?.status === 401) {
//             console.warn("🚨 401 Unauthorized: 로그인 페이지로 이동");
//             handleLogout();
//           } else {
//             console.error("🚨 사용자 정보 로드 오류:", error);
//             alert("사용자 정보를 불러올 수 없습니다.");
//           }
//         }
//       };

//       fetchUserData();
//     } else {
//       alert("로그인 실패! 다시 시도해주세요.");
//       navigate("/login");
//     }
//   }, [navigate]);

//   // 🔄 로그아웃 및 로그인 페이지로 이동
//   const handleLogout = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("user"); // ✅ 사용자 정보도 삭제
//     alert("세션이 만료되었습니다. 다시 로그인해주세요.");
//     navigate("/login");
//   };

//   return (
//     <div>
//       <h2>로그인 중...</h2>
//       {user && (
//         <div>
//           <p>닉네임: {user.nickName}</p>
//           <p>이메일: {user.email}</p>

//           <img src={user.picture} alt="프로필 이미지" width="100" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginCallback;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";  // ✅ api.js 사용

const LoginCallback = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const refreshToken = urlParams.get("refreshToken");

    console.log("🔹 받은 Access Token:", token);
    console.log("🔹 받은 Refresh Token:", refreshToken);

    if (token && refreshToken) {
      // ✅ 토큰 저장
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);

      // ✅ URL에서 쿼리 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      // ✅ 사용자 정보 요청
      const fetchUserData = async () => {
        try {
          const response = await api.get(`/users/me`);
          console.log("✅ 사용자 정보:", response.data);
          localStorage.setItem("user", JSON.stringify(response.data)); // ✅ 사용자 정보 저장
          setUser(response.data);
          navigate("/whole-schedule", { replace: true }); // ✅ 페이지 이동
        } catch (error) {
          console.error("🚨 사용자 정보 로드 오류:", error);
          alert("사용자 정보를 불러올 수 없습니다.");
          navigate("/login");
        }
      };

      fetchUserData();
    } else {
      alert("로그인 실패! 다시 시도해주세요.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h2>로그인 중...</h2>
      {user && (
        <div>
          <p>닉네임: {user.nickName}</p>
          <p>이메일: {user.email}</p>
          <img src={user.picture} alt="프로필 이미지" width="100" />
        </div>
      )}
    </div>
  );
};

export default LoginCallback;
