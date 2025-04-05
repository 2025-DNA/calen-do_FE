import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/login/Login"; // Login 페이지 import
import WholeSchedule from "./pages/schedule/WholeSchedule"; // 로그인 성공 시 이동할 페이지 import
import Home from "./pages/home/Home"; // 기존 Home 페이지
import { InvitePage } from "./pages/invite/InvitePage";
import CreatePlan from "./pages/create/createPlan";
import CreateTime from "./pages/create/createTime";
import CheckTime from "./pages/check/checkTime";
import MyPage from "../src/pages/myPage/MyPage"
import LoginCallback from "./pages/login/LoginCallback";
import Alert from "./pages/alert/alertPage";

import { InviteCheck } from "./pages/invite/InviteCheck";
import MyTimeList from "./pages/check/MyTimeList";

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/whole-schedule" element={<WholeSchedule />} />
            <Route path="/home" element={<Home />} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/plan" element={<CreatePlan />} />
            <Route path="/time" element={<CreateTime />} />
            <Route path="/check-time/:projectId/:timetableId" element={<CheckTime />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/alert" element={<Alert />} />
            <Route path="/invitecheck" element={<InviteCheck />} />
            <Route path="/mytime/:projectId/:timetableId" element={<MyTimeList />} /> {/* ✅ 추가된 라우트 */}
        </Routes>
    );
};


export default Router;
