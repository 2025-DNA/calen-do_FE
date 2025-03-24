import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "react-calendar/dist/Calendar.css";
import * as S from "./styled";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import backIcon from "../../assets/icons/backbtn.svg";

dayjs.locale("ko");

function CreatePlan() {
    const navigate = useNavigate();
    const [date, setDate] = useState(null);
    const [startTime, setStartTime] = useState("09:00:00");
    const [endTime, setEndTime] = useState("22:00:00");
    const [meetingName, setMeetingName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [projectId, setProjectId] = useState(50); // 예시값. 필요 시 props나 context 등으로 받기
    const today = new Date();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }
                const response = await api.get("/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUser(response.data);
            } catch (error) {
                console.error("사용자 정보 불러오기 실패:", error);
                alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
            }
        };
        fetchCurrentUser();
    }, []);

    const handleCreate = async () => {
        if (!date || date.length !== 2 || !meetingName || !deadline) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        const [startDate, endDate] = date.map((d) => dayjs(d).format("YYYY-MM-DD"));
        const formattedDeadline = dayjs(deadline).format("YYYY-MM-DDT00:00:00");
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken || !currentUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const requestData = {
            projectId,
            userId: currentUser.userId,
            startDate,
            endDate,
            startTime,
            endTime,
            meetingName,
            deadline: formattedDeadline,
        };

        try {
            const response = await api.post(
                `/api/timetables/${projectId}/create`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            alert("일정이 생성되었습니다.");
            console.log("✅ 서버 응답:", response.data);

            const timetableId = response.data.timetableId;

            // 생성 후 역할에 따라 이동
            checkCaptainAndRedirect(
                projectId,
                startDate,
                endDate,
                startTime,
                endTime,
                timetableId
            );

        } catch (error) {
            console.error("API 요청 에러:", error);
            alert("일정 생성에 실패했습니다.");
        }
    };

    const checkCaptainAndRedirect = async (projectId, startDate, endDate, startTime, endTime, timetableId) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            console.log("🔑 accessToken:", accessToken);

    
            const userRes = await api.get("/api/users/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const currentUserId = userRes.data.userId;
    
            const projectRes = await api.get(`/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const createdBy = projectRes.data.createdBy;
    
            if (currentUserId === createdBy) {
                alert("✅ captain입니다.");
            } else {
                alert("✅ member입니다.");
            }
    
            navigate(`/time?projectId=${projectId}`, {
                state: {
                date: [startDate, endDate],
                startTime,
                endTime,
                timetableId,
                projectId, // ✅ 이거도 state에 넣어야 CreateTime에서 받을 수 있음
                userId: currentUserId // ✅ userId 추가
            }
            });
        } catch (error) {
            console.error("❌ 사용자/프로젝트 정보 조회 실패:", error);
            alert("사용자 정보 확인 중 오류가 발생했습니다.");
        }
    };
    

    return (
        <S.Container className="create-plan">
            <S.Header>
                <S.BackButton onClick={() => navigate(-1)}>
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
                <S.Title>새로운 일정</S.Title>
            </S.Header>
            <S.Main>
                <S.CalendarWrapper>
                    <S.StyledCalendar
                        onChange={setDate}
                        value={date}
                        next2Label={null}
                        prev2Label={null}
                        selectRange={true}
                        minDate={today}
                        formatDay={(locale, date) => dayjs(date).format("DD")}
                        formatMonthYear={(locale, date) => dayjs(date).format("MMMM")}
                    />
                </S.CalendarWrapper>

                <S.TimePickerWrapper>
                    <S.Select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    >
                        {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={`${String(i).padStart(2, "0")}:00:00`}>
                                {`${String(i).padStart(2, "0")}:00`}
                            </option>
                        ))}
                    </S.Select>

                    <S.Select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    >
                        {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={`${String(i).padStart(2, "0")}:00:00`}>
                                {`${String(i).padStart(2, "0")}:00`}
                            </option>
                        ))}
                    </S.Select>
                </S.TimePickerWrapper>

                <S.InputWrapper>
                    <S.Label>회의명</S.Label>
                    <S.TextInput
                        type="text"
                        placeholder="회의명을 입력하세요"
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                    />
                </S.InputWrapper>

                <S.DatePickerWrapper>
                    <S.Label>일정 선택 마감 시간</S.Label>
                    <S.DateInput
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </S.DatePickerWrapper>

                <S.Button onClick={handleCreate}>Create</S.Button>
            </S.Main>
        </S.Container>
    );
}

export default CreatePlan;
