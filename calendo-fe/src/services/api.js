import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://calendo.site";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ 요청마다 자동으로 Authorization 헤더 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken"); // ✅ 로컬 스토리지에서 토큰 가져오기
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // ✅ 헤더 추가
        } else {
            console.warn("🚨 로그인 토큰이 없습니다. 인증이 필요합니다.");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
