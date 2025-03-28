// utils/auth.js
export const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access-token") ||
      localStorage.getItem("jwt_token") ||
      null
    );
  };
  