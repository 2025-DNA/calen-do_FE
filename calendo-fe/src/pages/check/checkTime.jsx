import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import * as S from "./styled";
import backIcon from "../../assets/icons/backbtn.svg";
import ProgressBar from "../../components/current/progressBar";
import ParticipantsBlock from "../../components/current/participantBlock";

function CheckTime() {
    const navigate = useNavigate();
    const location = useLocation();
    const { date, startTime, endTime, selectedTimes, projectId } = location.state || {};

    const headCount = 5;
    const participants = ["Alice", "Bob", "Charlie"];

    const [availableTimes, setAvailableTimes] = useState([]);

    useEffect(() => {
        const fetchAvailableTimes = async () => {
            if (!projectId) {
                console.warn("projectId가 없습니다.");
                return;
            }
            try {
                const response = await axios.get(`https://calendo.site/api/projects/${projectId}/available_times`);
                console.log("서버 응답 데이터:", response.data); // 이 부분 추가
                setAvailableTimes(response.data);
            } catch (error) {
                console.error("Error fetching available times:", error);
                if (error.response) {
                    console.error("서버 응답 상태:", error.response.status);
                    console.error("서버 응답 데이터:", error.response.data);
                }
            }
        };
    
        fetchAvailableTimes();
    }, [projectId]);
    

    const selectedSet = new Set(selectedTimes || []);

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

    const getCellClassName = (date, time) => {
        const dateStr = date.toISOString().split("T")[0];
        const [hour, minute] = time.split(":").map(Number);
        const cellTime = new Date(date);
        cellTime.setHours(hour);
        cellTime.setMinutes(minute);

        // 내가 선택한 시간인지 확인
        const dateIndex = dateColumns.findIndex(d => d.toDateString() === date.toDateString());
        const myTimeKey = `${time}-${dateIndex}`;
        const isMine = selectedSet.has(myTimeKey);

        // 참여자 중 가능한 사람 수 계산
        const othersCount = availableTimes.filter(({ userId, date: d, startTime, endTime }) => {
            if (d !== dateStr) return false;
            const start = new Date(`${d}T${startTime}`);
            const end = new Date(`${d}T${endTime}`);
            return cellTime >= start && cellTime < end;
        }).length;

        if (isMine && othersCount > 0) return "both";
        if (isMine) return "mine";
        if (othersCount > 0) return `others-${othersCount > 3 ? 3 : othersCount}`;
        return "";
    };

    return (
        <S.Container>
            <S.Header>
                <S.BackButton onClick={() => navigate("/whole-schedule")}>
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
                <S.Title>New Plan Name</S.Title>
            </S.Header>
            <S.Body>
                <S.Table>
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
                                {dateColumns.map((day, j) => (
                                    <td key={j} className={getCellClassName(day, time)} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </S.Table>
            </S.Body>
            <S.Main>
                <S.SubTitle>현재 참여자</S.SubTitle>
                <ProgressBar headCount={headCount} participants={participants} />
                <S.Participants>
                    {participants.map((participant, index) => (
                        <ParticipantsBlock key={index} participant={participant} />
                    ))}
                    {Array(headCount - participants.length).fill("?").map((_, index) => (
                        <ParticipantsBlock key={`empty-${index}`} participant="?" />
                    ))}
                </S.Participants>
            </S.Main>
            <S.Bottom>
                <S.SelectButton onClick={() => navigate(-1)}>수정하기</S.SelectButton>
            </S.Bottom>
        </S.Container>
    );
}

export default CheckTime;
