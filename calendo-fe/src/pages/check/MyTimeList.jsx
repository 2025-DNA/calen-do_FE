import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as S from "./styled";
import api from "../../services/api";
import backIcon from "../../assets/icons/backbtn.svg";
import dayjs from "dayjs";

function MyTimeList() {
    const navigate = useNavigate();
    const { projectId, timetableId } = useParams();

    const [userId, setUserId] = useState(null);
    const [date, setDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [selectedTimes, setSelectedTimes] = useState(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);

    useEffect(() => {
        const fetchUserAndTimetable = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const userRes = await api.get("/api/users/me", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log("📌 사용자 정보:", userRes.data);
                setUserId(userRes.data.userId);
        
                const res = await api.get(
                    `/api/projects/${projectId}/available_times/latest-timetable`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                console.log("📌 타임테이블 정보:", res.data);
        
                const data = res.data;
                setDate([data.startDate, data.endDate]);
                setStartTime(data.startTime.split(":")[0]);
                setEndTime(data.endTime.split(":")[0]);
        
                if (timetableId) {
                    fetchMyAvailableTimes(userRes.data.userId, data.startDate, data.endDate);
                }
            } catch (error) {
                console.error("❌ 사용자 또는 타임테이블 정보 불러오기 실패:", error);
                alert("정보를 불러오는 데 실패했습니다.");
                navigate("/");
            }
        };
        

        const fetchMyAvailableTimes = async (uid, startDate, endDate) => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const res = await api.get(`/api/projects/${projectId}/available_times/my`, {
                    params: { timetableId },
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log("내가 선택한 시간:", res.data);
        
                setAvailableTimes(res.data);
                const dateCols = generateDateColumns(startDate, endDate);
                const newSet = new Set();
        
                res.data.forEach((entry) => {
                    const dateObj = new Date(entry.date);
                    const dateIndex = dateCols.findIndex(d => d.toDateString() === dateObj.toDateString());
        
                    const [startH, startM] = entry.startTime.split(":").map(Number);
                    const [endH, endM, endS] = entry.endTime.split(":").map(Number);
        
                    // 초가 0이 아니면 다음 블록까지 포함되도록 처리
                    let realEndH = endH;
                    let realEndM = endM;
                    if (endS > 0) {
                        if (endM === 0) {
                            realEndM = 30;
                        } else {
                            realEndM = 0;
                            realEndH += 1;
                        }
                    }
        
                    let hour = startH;
                    let minute = startM;
        
                    while (hour < realEndH || (hour === realEndH && minute < realEndM)) {
                        const key = `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : "30"}-${dateIndex}`;
                        newSet.add(key);
        
                        if (minute === 0) {
                            minute = 30;
                        } else {
                            minute = 0;
                            hour++;
                        }
                    }
                });
        
                setSelectedTimes(newSet);
                console.log("✅ selectedTimes Set:", Array.from(newSet));
            } catch (err) {
                console.error("❌ 내 가능 시간 불러오기 실패:", err);
                alert("잘못된 접근입니다.");
                navigate("/whole-schedule");
            }
        };
        

        fetchUserAndTimetable();
    }, [projectId, timetableId, navigate]);

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

    const generateDateColumns = (s = date?.[0], e = date?.[1]) => {
        if (!s || !e) return [];
        let current = new Date(s);
        const endDate = new Date(e);
        const days = [];
        while (current <= endDate) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
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
            setSelectedTimes((prev) => new Set(prev).add(timeKey));
        }
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleUpdate = async () => {
        const accessToken = localStorage.getItem("accessToken");

        console.log("🚨 userId 확인:", userId);

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
    
        try {
            const dateCols = generateDateColumns();
    
            const parseTime = (timeStr) => {
                const [h, m] = timeStr.split(":").map(Number);
                return h * 60 + m;
            };
    
            const groupContinuousBlocks = (timeList) => {
                const sorted = timeList.sort((a, b) => parseTime(a) - parseTime(b));
                const result = [];
                let temp = [];
    
                for (let i = 0; i < sorted.length; i++) {
                    const current = parseTime(sorted[i]);
                    const next = i + 1 < sorted.length ? parseTime(sorted[i + 1]) : null;
    
                    temp.push(sorted[i]);
    
                    if (next === null || next - current > 30) {
                        result.push([...temp]);
                        temp = [];
                    }
                }
    
                return result;
            };
    
            // 1. 현재 선택된 시간들을 날짜별로 나누고, 연속 블록으로 분리
            const newTimeMap = {}; // dateString => [{ startTime, endTime }]
            dateCols.forEach((dateObj, dateIndex) => {
                const dateStr = dayjs(dateObj).format("YYYY-MM-DD");
    
                const selectedForDate = Array.from(selectedTimes)
                    .filter((key) => key.endsWith(`-${dateIndex}`))
                    .map((key) => key.split("-")[0]);
    
                const grouped = groupContinuousBlocks(selectedForDate);
    
                newTimeMap[dateStr] = grouped.map((block) => {
                    let [sh, sm] = block[0].split(":").map(Number);
                    let [eh, em] = block[block.length - 1].split(":").map(Number);
                    if (em === 0) {
                        em = 30;
                    } else {
                        em = 0;
                        eh += 1;
                    }
                    return {
                        startTime: `${String(sh).padStart(2, "0")}:${sm === 0 ? "00" : "30"}`,
                        endTime: `${String(eh).padStart(2, "0")}:${em === 0 ? "00" : "30"}`
                    };
                });
            });
    
            // 2. 기존 availableTimes와 비교
            const toDelete = [];
            const toKeepSet = new Set(); // "date|start|end" 형태로 저장
    
            availableTimes.forEach((entry) => {
                const dateStr = dayjs(entry.date).format("YYYY-MM-DD");
                const start = entry.startTime.slice(0, 5);
                const end = entry.endTime.slice(0, 5);
                const newBlocks = newTimeMap[dateStr] || [];
    
                const matched = newBlocks.find(b => b.startTime === start && b.endTime === end);
    
                if (matched) {
                    // 유지
                    toKeepSet.add(`${dateStr}|${start}|${end}`);
                } else {
                    // 삭제 대상
                    toDelete.push(entry.availableId);
                }
            });
    
            // 3. DELETE 요청
            for (const id of toDelete) {
                console.log("⛔ DELETE 요청:", id);
                await api.delete(
                    `/api/projects/${projectId}/available_times/timetable/${timetableId}/my/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
            }
    
            // 4. POST 요청 (새로운 블록 중 기존에 없던 것만)
            // 1. 추가할 블록을 모두 수집
const newAvailableList = [];

for (const [date, blocks] of Object.entries(newTimeMap)) {
  for (const block of blocks) {
    const key = `${date}|${block.startTime}|${block.endTime}`;
    if (!toKeepSet.has(key)) {
      console.log("✅ POST 블록 수집:", { date, ...block });
      newAvailableList.push({
        timetableId,
        projectId,
        userId,
        date,
        startTime: block.startTime,
        endTime: block.endTime
      });
    }
  }
}

// 2. 한 번에 배열 전송
if (newAvailableList.length > 0) {
  await api.post(
    `/api/projects/${projectId}/available_times`,
    newAvailableList,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );
}

            
    
            alert("가능 시간을 성공적으로 수정했습니다.");
            navigate(`/check-time/${projectId}/${timetableId}`);
        } catch (error) {
            console.error("❌ 수정 실패:", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    };
    

    if (!date || !startTime || !endTime || !timetableId) {
        return <div>타임테이블 정보를 불러오는 중입니다...</div>;
    }

    return (
        <S.Container>
            <S.Header>
                <S.BackButton onClick={() => navigate(-1)}>
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
                <S.Title>가능 시간 수정</S.Title>
            </S.Header>
            <S.Bodys>
                <S.Tables onMouseUp={handleMouseUp}>
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
                </S.Tables>
            </S.Bodys>
            <S.Bottoms>
                <S.SelectButton onClick={handleUpdate}>수정 완료</S.SelectButton>
            </S.Bottoms>
        </S.Container>
    );
}

export default MyTimeList;
