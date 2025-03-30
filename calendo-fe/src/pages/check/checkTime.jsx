import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import * as S from "./styled";
import backIcon from "../../assets/icons/backbtn.svg";
import ProgressBar from "../../components/current/progressBar";
import ParticipantsBlock from "../../components/current/participantBlock";

function CheckTime() {
    const navigate = useNavigate();
    const { projectId, timetableId } = useParams();
    const [availableTimes, setAvailableTimes] = useState([]);
    const [checkedUserCount, setCheckedUserCount] = useState(0);
    const [totalMemberCount, setTotalMemberCount] = useState(0);
    const [timetable, setTimetable] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId || !timetableId) {
                console.warn("projectId 또는 timetableId가 없습니다.");
                return;
            }
    
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }
    
                const res = await api.get(
                    `/api/projects/${projectId}/available_times/timetable/${timetableId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                console.log("서버 응답:", res.data);
                setAvailableTimes(res.data.availableTimes);
                setCheckedUserCount(res.data.checkedUserCount);
                setTotalMemberCount(res.data.totalMemberCount);
                if (res.data.availableTimes.length > 0) {
                    setTimetable(res.data.availableTimes[0].timetableId);
                }
            } catch (err) {
                console.error("데이터 불러오기 실패:", err);
                alert("타임테이블 데이터를 불러올 수 없습니다.");
            }
        };
    
        fetchData();
    }, [projectId, timetableId, navigate]);
    

    if (!timetable) return <div>로딩 중...</div>;

    const selectedSet = new Set(); // 본인 선택 정보는 이 화면에서는 비어 있음 (원하면 추가 가능)

    const generateTimeSlots = () => {
        const start = parseInt(timetable.startTime.split(":")[0]);
        const end = parseInt(timetable.endTime.split(":")[0]);
        const times = [];
        for (let hour = start; hour <= end; hour++) {
            times.push(`${hour}:00`);
            times.push(`${hour}:30`);
        }
        return times;
    };

    const generateDateColumns = () => {
        const startDate = new Date(timetable.startDate);
        const endDate = new Date(timetable.endDate);
        let days = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
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

        const dateIndex = dateColumns.findIndex(d => d.toDateString() === date.toDateString());
        const myTimeKey = `${time}-${dateIndex}`;
        const isMine = selectedSet.has(myTimeKey);

        const othersCount = availableTimes.filter(({ date: d, startTime, endTime }) => {
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
                <S.Title>{timetable.meetingName}</S.Title>
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
                <S.SubTitle>
                현재 참여자 ({checkedUserCount}명/총 {totalMemberCount}명)
                </S.SubTitle>
                <ProgressBar headCount={totalMemberCount} participants={Array(checkedUserCount).fill("✓")} />
                <S.Participants>
                    {Array(checkedUserCount).fill().map((_, index) => (
                        <ParticipantsBlock key={index} participant={`참여자 ${index + 1}`} />
                    ))}
                    {Array(totalMemberCount - checkedUserCount).fill().map((_, index) => (
                        <ParticipantsBlock key={`empty-${index}`} participant="?" />
                    ))}
                </S.Participants>
            </S.Main>
            <S.Bottom>
            <S.SelectButton1
                onClick={() => {
                    console.log("🚀 이동할 때 projectId:", projectId);
                    console.log("🚀 이동할 때 timetableId:", timetableId);

                    navigate(`/mytime/${projectId}/${timetableId}`);
                }}
                >
                수정하기
            </S.SelectButton1>
            <S.SelectButton2
                onClick={async () => {
                    const accessToken = localStorage.getItem("accessToken");
                    if (!accessToken) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                    }

                    // 1. 겹치는 시간 계산
                    const overlapMap = {};

                    availableTimes.forEach(({ date, startTime, endTime }) => {
                    const start = new Date(`${date}T${startTime}`);
                    const end = new Date(`${date}T${endTime}`);

                    let current = new Date(start);
                    while (current < end) {
                        const key = `${date}_${current.getHours()}:${current.getMinutes() === 0 ? "00" : "30"}`;
                        overlapMap[key] = (overlapMap[key] || 0) + 1;

                        if (current.getMinutes() === 0) {
                        current.setMinutes(30);
                        } else {
                        current.setMinutes(0);
                        current.setHours(current.getHours() + 1);
                        }
                    }
                    });

                    // 2. 참여자 전원이 공통으로 선택한 시간 찾기
                    const commonSlots = Object.entries(overlapMap).filter(
                    ([, count]) => count === totalMemberCount
                    );

                    if (commonSlots.length === 0) {
                    alert("모든 참여자가 공통으로 선택한 시간이 없습니다.");
                    return;
                    }

                    // 3. 첫 번째 공통 시간 선택
                    const [firstKey] = commonSlots[0]; // ex: "2025-03-01_14:00"
                    const [confirmedDate, confirmedStartTime] = firstKey.split("_");
                    const [hour, minute] = confirmedStartTime.split(":");
                    const confirmedEndTime = `${String(Number(hour)).padStart(2, "0")}:${minute === "00" ? "30" : "00"}`;

                    // 4. 서버로 POST 요청
                    try {
                    const res = await api.post(
                        `/api/projects/${projectId}/timetable/${timetableId}/final_meetings`,
                        {
                        projectId: Number(projectId),
                        confirmedDate,
                        meetingTitle: timetable.meetingName || "최종 회의",
                        confirmedStartTime: `${hour}:${minute}:00`,
                        confirmedEndTime: `${confirmedEndTime}:00`,
                        },
                        {
                        headers: { Authorization: `Bearer ${accessToken}` }
                        }
                    );

                    alert("최종 회의 일정이 등록되었습니다.");
                    console.log("✅ 서버 응답:", res.data);
                    } catch (error) {
                    console.error("❌ 회의 등록 실패:", error);
                    alert("회의 일정 등록 중 오류가 발생했습니다.");
                    }
                }}
                >
                일정 추가하기
                </S.SelectButton2>

            </S.Bottom>
        </S.Container>
    );
}

export default CheckTime;
