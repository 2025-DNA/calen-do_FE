import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as S from "./styled";
import api from "../../services/api";
import backIcon from "../../assets/icons/backbtn.svg";
import dayjs from "dayjs";

function CreateTime() {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId, userId } = location.state || {};

    const [date, setDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [timetableId, setTimetableId] = useState(null);
    const [selectedTimes, setSelectedTimes] = useState(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);

    useEffect(() => {
        const fetchLatestTimetable = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const response = await api.get(
                    `/api/projects/${projectId}/available_times/latest-timetable`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
    
                console.log("📦 latest timetable 응답:", response.data); // ← 응답 확인용
    
                const data = response.data;
    
                // 값이 없으면 예외 처리
                if (!data || !data.startDate || !data.endDate || !data.startTime || !data.endTime || !data.timetableId) {
                    alert("타임테이블 정보가 올바르지 않습니다. 팀장이 먼저 일정을 생성해야 합니다.");
                    navigate("/");
                    return;
                }
    
                // 데이터 세팅
                setDate([data.startDate, data.endDate]);
                setStartTime(data.startTime.split(":")[0]); // ✅ 이제 안전하게 사용 가능
                setEndTime(data.endTime.split(":")[0]);
                setTimetableId(data.timetableId);
            } catch (error) {
                console.error("❌ 타임테이블 불러오기 실패:", error);
                alert("타임테이블 정보를 불러오는 데 실패했습니다.");
                navigate("/");
            }
        };
    
        if (projectId) fetchLatestTimetable();
    }, [projectId, navigate]);
    
    // 테이블 생성 관련 함수
    const generateTimeSlots = () => {
        if (!startTime || !endTime) return [];
        const times = [];
        let start = parseInt(startTime);
        let end = parseInt(endTime);
        if (isNaN(start) || isNaN(end) || start > end) return [];

        for (let hour = start; hour <= end; hour++) {
            times.push(`${hour}:00`);
            times.push(`${hour}:30`);
        }
        return times;
    };

    const generateDateColumns = () => {
        if (!date || !Array.isArray(date)) return [];
        const [startDate, endDate] = date;
        let days = [];
        let currentDate = new Date(startDate);
        while (currentDate <= new Date(endDate)) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    };

    const timeSlots = generateTimeSlots();
    const dateColumns = generateDateColumns();

    const handleMouseDown = (timeKey) => {
        setIsMouseDown(true);
        setSelectedTimes((prev) => {
            const newSet = new Set(prev);
            newSet.has(timeKey) ? newSet.delete(timeKey) : newSet.add(timeKey);
            return newSet;
        });
    };

    const handleMouseMove = (timeKey) => {
        if (isMouseDown) {
            setSelectedTimes((prev) => {
                const newSet = new Set(prev);
                newSet.add(timeKey);
                return newSet;
            });
        }
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleCreate = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const payload = [];

        dateColumns.forEach((dateObj, dateIdx) => {
            const selectedForDate = Array.from(selectedTimes)
                .filter((key) => key.endsWith(`-${dateIdx}`))
                .map((key) => key.split("-")[0]);

            if (selectedForDate.length > 0) {
                selectedForDate.sort();
                const first = selectedForDate[0];
                const last = selectedForDate[selectedForDate.length - 1];

                payload.push({
                    timetableId,
                    projectId,
                    userId,
                    date: dayjs(dateObj).format("YYYY-MM-DD"),
                    startTime: `${first}:00`,
                    endTime: `${last}:00`
                });
            }
        });

        try {
            await api.post(`/api/projects/${projectId}/available_times`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });
            alert("가능 시간을 성공적으로 저장했습니다.");
            navigate(`/check-time/${projectId}/${timetableId}`);
        } catch (error) {
            console.error("❌ 가능 시간 전송 실패:", error);
            alert("가능 시간을 저장하는 중 오류가 발생했습니다.");
        }
    };

    // ⏳ 타임테이블이 불러오기 전이면 대기 화면
    if (!date || !startTime || !endTime || !timetableId) {
        return <div>타임테이블 정보를 불러오는 중입니다...</div>;
    }

    return (
        <S.Container>
            <S.Header>
                <S.BackButton onClick={() => navigate(-1)}>
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
                <S.Title>가능 시간 선택</S.Title>
            </S.Header>
            <S.Body>
                <S.Table onMouseUp={handleMouseUp}>
                    <thead>
                        <tr>
                            <th></th>
                            {dateColumns.map((day, index) => (
                                <th key={index}>{day.getMonth() + 1}월 {day.getDate()}일</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((time, i) => (
                            <tr key={i}>
                                <td>{time}</td>
                                {dateColumns.map((_, j) => {
                                    const timeKey = `${time}-${j}`;
                                    return (
                                        <td
                                            key={j}
                                            className={selectedTimes.has(timeKey) ? "selected" : ""}
                                            onMouseDown={() => handleMouseDown(timeKey)}
                                            onMouseMove={() => handleMouseMove(timeKey)}
                                        />
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </S.Table>
            </S.Body>
            <S.Bottom>
                <S.SelectButton onClick={handleCreate}>선택 완료</S.SelectButton>
            </S.Bottom>
        </S.Container>
    );
}

export default CreateTime;
