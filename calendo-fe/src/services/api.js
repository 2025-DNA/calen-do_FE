import axios from "axios";

const api = axios.create({
    baseURL: "https://calendo.site/api", // 백엔드 API 기본 URL
    withCredentials: true, // 쿠키 전송 허용
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ 요청마다 자동으로 Authorization 헤더 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
