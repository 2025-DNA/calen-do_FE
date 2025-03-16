// import React, { useState, useEffect }  from "react";
// import { useNavigate } from "react-router-dom";
// import "./MyPage.css";
// import bigprofileIcon from "../../assets/images/bigprofile.svg"; // 기본 프로필 아이콘
// import backIcon from "../../assets/images/backicon.svg";

// const MyPage = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState({ email: "" });
//   const userId = localStorage.getItem("userId"); // ✅ 저장된 사용자 ID 가져오기
//   const accessToken = localStorage.getItem("access_token"); // ✅ 저장된 토큰 가져오기


// useEffect(() => {
//   if (!accessToken) return;

//   fetch(`/api/users/me`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${accessToken}`, // ✅ 토큰 포함
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => setUser(data))
//     .catch((error) => console.error("사용자 정보를 불러오지 못했습니다.", error));
// }, [accessToken]);

// const nickname = user.email ? user.email.split("@")[0] : "unknown";



//   return (
//     <div className="mypage-container">
//       {/* 상단 네비게이션 */}
//       <div className="mypage-header">
//         <img src={backIcon} className="back-icon" onClick={() => navigate(-1)} />
//       </div>

//       {/* 프로필 영역 */}
//       <div className="profile-section">
//         <div className="profile-container">
//           <img src={bigprofileIcon} alt="프로필 아이콘" className="profile-icon" />
//         </div>
//       </div>

//    {/* 유저 정보 */}
//    <div className="user-info">
//         <h3 className="section-title">내 정보</h3>

//         <div className="info-box">
//           <label className="info-label">닉네임 :</label>
//           <input type="text" value={nickname} readOnly className="info-input" />
//         </div>

//         <div className="info-box">
//           <label className="info-label">이메일 :</label>
//           <input type="text" value={user.email || "unknown@gmail.com"} readOnly className="info-input" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import bigprofileIcon from "../../assets/images/bigprofile.svg"; // 기본 프로필 아이콘
import backIcon from "../../assets/images/backicon.svg";

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", name: "" });

  useEffect(() => {
    // ✅ localStorage에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem("user");

    console.log("📌 localStorage에서 가져온 user 데이터:", storedUser); // 콘솔 확인

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("🚨 사용자 정보 JSON 파싱 오류:", error);
      }
    }
  }, []);

  // ✅ 이메일에서 닉네임 추출 (@ 앞부분)
  const nickname = user.email ? user.email.split("@")[0] : "unknown";

  return (
    <div className="mypage-container">
      {/* 상단 네비게이션 */}
      <div className="mypage-header">
        <img src={backIcon} className="back-icon" onClick={() => navigate(-1)} />
      </div>

      {/* 프로필 영역 */}
      <div className="profile-section">
        <div className="profile-container">
          <img src={bigprofileIcon} alt="프로필 아이콘" className="profile-icon" />
        </div>
      </div>

      {/* 유저 정보 */}
      <div className="user-info">
        <h3 className="section-title">내 정보</h3>

        <div className="info-box">
          <label className="info-label">닉네임 :</label>
          <input type="text" value={nickname} readOnly className="info-input" />
        </div>

        <div className="info-box">
          <label className="info-label">이메일 :</label>
          <input type="text" value={user.email || "unknown@gmail.com"} readOnly className="info-input" />
        </div>
      </div>
    </div>
  );
};

export default MyPage;

