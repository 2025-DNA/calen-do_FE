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

export default api;
