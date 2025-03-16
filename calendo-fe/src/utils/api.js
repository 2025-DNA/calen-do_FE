// import axios from "axios";

// // ✅ Axios 인스턴스 생성
// const api = axios.create({
//   baseURL: "https://calendo.site/api", // 백엔드 API 주소
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true, // Refresh Token을 쿠키로 보내는 경우 필요
// });

// // ✅ 요청 인터셉터: 모든 요청에 `Access Token` 추가
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken"); // 저장된 `Access Token`
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ 응답 인터셉터: `401 Unauthorized` 발생 시 `Refresh Token`으로 재발급
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.log("🔹 Access Token 만료됨. Refresh Token으로 재발급 시도...");

//       const refreshToken = localStorage.getItem("refreshToken"); // Refresh Token 가져오기
//       if (!refreshToken) {
//         console.error("❌ Refresh Token 없음. 로그인 페이지로 이동.");
//         localStorage.removeItem("accessToken");
//         window.location.href = "/login"; // 로그인 페이지로 이동
//         return Promise.reject(error);
//       }

//       try {
//         // ✅ 새로운 Access Token 요청
//         const response = await axios.post("https://calendo.site/api/auth/refresh", {
//           refreshToken,
//         });

//         const newAccessToken = response.data.accessToken;
//         console.log("✅ 새 Access Token 발급 완료:", newAccessToken);

//         // ✅ 새로운 Access Token 저장
//         localStorage.setItem("accessToken", newAccessToken);

//         // ✅ 원래 요청을 새로운 Access Token으로 재시도
//         error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
//         return axios(error.config);
//       } catch (refreshError) {
//         console.error("❌ Refresh Token 만료됨. 다시 로그인 필요.");
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/login"; // 로그인 페이지로 이동
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://calendo.site/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,  // ✅ Refresh Token을 쿠키로 보내는 경우 필요
});

// ✅ 요청 인터셉터: `Access Token` 추가
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  

// ✅ 응답 인터셉터: `401 Unauthorized` 발생 시 `Refresh Token`으로 재발급
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🔹 Access Token 만료됨. Refresh Token으로 재발급 시도...");

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("❌ Refresh Token 없음. 로그인 페이지로 이동.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ 새로운 Access Token 요청
        const response = await axios.post("https://calendo.site/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        console.log("✅ 새 Access Token 발급 완료:", newAccessToken);

        // ✅ 새로운 Access Token 저장
        localStorage.setItem("accessToken", newAccessToken);

        // ✅ 원래 요청을 새로운 Access Token으로 재시도
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error("❌ Refresh Token 만료됨. 다시 로그인 필요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
