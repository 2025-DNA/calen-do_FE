import React, { useState } from "react";
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
    const [meetingName, setMeetingName] = useState(""); // 회의명 입력
    const [deadline, setDeadline] = useState(""); // 마감 날짜 입력
    const today = new Date();

    const handleCreate = async () => {
        if (!date || date.length !== 2 || !meetingName || !deadline) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        const [startDate, endDate] = date.map((d) => dayjs(d).format("YYYY-MM-DD"));
        const formattedDeadline = dayjs(deadline).format("YYYY-MM-DDT00:00:00");

        //localStorage에서 accessToken 가져오기
        const accessToken = localStorage.getItem("accessToken");
        console.log("local token", accessToken);
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const requestData = {
            projectId: 9, // 실제 프로젝트 ID 필요
            userId: 14, // 로그인된 사용자 ID 필요
            startDate,
            endDate,
            startTime,
            endTime,
            meetingName,
            deadline: formattedDeadline,
        };

        try {
            const response = await api.post(
                `/api/timetables/${requestData.projectId}/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`, // ✅ 추가된 부분
                    },
                    body: JSON.stringify(requestData),
                    mode: "cors", // ✅ CORS 모드 설정
                    credentials: "include", // ✅ 세션 기반 인증을 사용할 경우 추가
                }
            );

            if (!response.ok) throw new Error("API 요청 실패");

            const responseData = await response.json();
            alert("일정이 생성되었습니다.");
            console.log("✅ 서버 응답:", responseData);

            navigate("/time", { state: responseData }); // 성공 시 이동
        } catch (error) {
            console.error("API 요청 에러:", error);
            alert("일정 생성에 실패했습니다.");
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
