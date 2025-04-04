import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getAccessToken } from "../../utils/auth";
import Modal from "react-modal";
import { FaUser, FaBell, FaCog, FaPlus, FaTrash, FaCheckCircle, FaTimes, FaClock, FaFileAlt } from "react-icons/fa"; 
import "./WholeSchedule.css";
import trashIcon from "../../assets/images/trash.svg";
import addMemberIcon from "../../assets/images/addmember.svg";
import addProjectIcon from "../../assets/images/addproject.svg";
import alertIcon from "../../assets/images/alert.svg";
import timeIcon from "../../assets/images/time.svg";
import profileIcon from "../../assets/images/profile.svg";
import checkIcon from "../../assets/images/check.svg";
import teammemberIcon from "../../assets/images/teammember.svg";
import exitIcon from "../../assets/images/x.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.module.css";

Modal.setAppElement("#root");

const WholeSchedule = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState({});
  const [todoLists, setTodoLists] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [eventType, setEventType] = useState("Schedule");
 
  const [selectedTime, setSelectedTime] = useState("");
  const [repeatOption, setRepeatOption] = useState("none");
  const [alertOption, setAlertOption] = useState("이벤트 당일(오전 9시)");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, isTodo: false });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);


  const [selectedColor, setSelectedColor] = useState("#FFCDD2"); // 기본 색상 설정
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nickname, setNickname] = useState("");
 
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [projectMembers, setProjectMembers] = useState({});


  // ✅ localStorage에서 닉네임 불러오기
  const storedUser = localStorage.getItem("user");
  const extractedNickname = storedUser ? JSON.parse(storedUser).email.split("@")[0] : "unknown";
  const defaultProject = `${extractedNickname}의 일정`;

  // ✅ 프로젝트 목록 및 데이터 관리
  const [projects, setProjects] = useState([defaultProject]);


 
  const [projectData, setProjectData] = useState({
    [defaultProject]: { events: {}, todoLists: {}, color: "#FFCDD2" },
  });
  
  const [selectedProject, setSelectedProject] = useState(defaultProject);

  const [mainScheduleFetchedOnce, setMainScheduleFetchedOnce] = useState(false);


  useEffect(() => {
    const saved = localStorage.getItem("selectedProject");
    if (saved) {
      setSelectedProject(saved);
    } else {
      setSelectedProject(defaultProject); // 없으면 메인 프로젝트로
      fetchEventsForDate(new Date()); // 🧠 바로 호출
    }
  }, []);
 
  // ✅ 1. 현재 달 ±1개월 미리 조회 (프리페칭)
useEffect(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  fetchMainSchedulesForMonth(year, month - 1); // 이전 달
  fetchMainSchedulesForMonth(year, month);     // 현재 달
  fetchMainSchedulesForMonth(year, month + 1); // 다음 달
}, []);

  
  useEffect(() => {
    const projectInfo = projectData[selectedProject];
    const projectId = projectInfo?.id;
  
    if (!projectInfo || projectInfo.events && Object.keys(projectInfo.events).length > 0) {
      return; // 🔥 이미 불러온 일정이면 호출 X
    }
  
    // ✅ 메인 일정이면 오늘 날짜만 조회 (한 번만)
    if (selectedProject === defaultProject) {
      fetchMainSchedulesForMonth(new Date().getFullYear(), new Date().getMonth());
      return;
    }
  
    // ✅ 프로젝트 일정이면 전체 스케줄 불러오기
    if (projectId) {
      fetchProjectSchedules(projectId).then((schedules) => {
        if (!schedules || !Array.isArray(schedules)) {
          console.warn("⚠️ 프로젝트 일정 응답이 비어있음");
          return;
        }
  
        const scheduleMap = {};
        schedules.forEach((schedule) => {
          const start = schedule.startDateTime || `${schedule.confirmedDate}T${schedule.confirmedStartTime}`;
          const end = schedule.endDateTime || `${schedule.confirmedDate}T${schedule.confirmedEndTime}`;
          //const dateKey = new Date(schedule.startDateTime).toDateString();
          const dateKey = new Date(start).toDateString(); // ✅ 이걸로 교체
          if (!scheduleMap[dateKey]) scheduleMap[dateKey] = [];
          scheduleMap[dateKey].push({
            ...schedule,
            id: schedule.projectScheduleId || schedule.meetingId || schedule.id,
            startDateTime: start,
            endDateTime: end,
            time: formatTime(start), // ✅ 시간 텍스트 표시
            type: "Schedule",
            color: projectInfo.color || "#FFCDD2",
           
          });
        });

  
        setEvents(scheduleMap);
        setProjectData((prev) => ({
          ...prev,
          [selectedProject]: {
            ...prev[selectedProject],
            events: scheduleMap,
          },
        }));
      });
    }
  }, [selectedProject, projectData]);
  

  // ✅ 프로젝트 바꿀 때마다 localStorage에도 저장
useEffect(() => {
  if (selectedProject) {
    localStorage.setItem("selectedProject", selectedProject);
  }
}, [selectedProject]);

// 최초 렌더링 시 1회 호출
// ✅ 최초 진입 또는 새로고침 시 한번만 호출
useEffect(() => {
  if (selectedProject === defaultProject && !mainScheduleFetchedOnce) {
    const today = new Date();
    fetchMainSchedulesForMonth(today.getFullYear(), today.getMonth());
    setMainScheduleFetchedOnce(true);
  }
}, [selectedProject, mainScheduleFetchedOnce]); // ← ✅ 중요


  
  


  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      console.warn("🔒 토큰 없음! 로그인 페이지로 이동합니다.");
      navigate("/login"); // 또는 로그인 경로
      return;
    }
    

      const today = new Date();
    if (selectedProject && selectedProject === defaultProject) {
      fetchEventsForDate(today);
    }
  }, [selectedProject]);
  
  
  

 //프로젝트 목록 조회하기
 useEffect(() => {
  const fetchProjects = async () => {
    const token = getAccessToken();
    if (!token) {
      console.warn("❌ 토큰 없음. 요청 취소");
      return null;
    }
    console.log("📌 access-token:", token)

    try {
      const response = await fetch(`https://calendo.site/api/projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("프로젝트 목록 조회 실패");

      const data = await response.json();
      console.log("✅ 프로젝트 목록:", data);

      const projectMap = {};
      
      const names = data.map(project => {
        const name = project.projectName; // ✅ 여기가 핵심
        projectMap[name] = {
          id: project.id,
          events: {},
          todoLists: {},
          color: "#ccf0ff"
        };
        return name; // ✅ name은 projectName에서 가져와야 함
      });


      // ✅ state 업데이트
      setProjects([defaultProject, ...names]);
      setProjectData((prev) => {
        return {
          ...prev,
          [defaultProject]: {
            ...prev[defaultProject],
            id: null // 🔥 메인 일정에는 id 명시적으로 추가!
          },
          ...projectMap,
        };
      });
    } catch (error) {
      console.error("❌ 프로젝트 목록 불러오기 실패:", error);
    }
  };

  fetchProjects();
}, []);


//팀원 정보 조회
useEffect(() => {
  console.log("🔍 selectedProject:", selectedProject);
  console.log("🔍 projectData[selectedProject]:", projectData[selectedProject]);

  if (selectedProject && selectedProject !== defaultProject) {
    const projectId = projectData[selectedProject]?.id;

    if (projectId) {
      console.log("📡 팀원 조회 projectId:", projectId);
      fetchProjectMembers(projectId);
    } else {
      console.warn("⚠️ projectId가 존재하지 않음:", selectedProject, projectData[selectedProject]);
    }
  }
}, [selectedProject, projectData]);


const fetchProjectMembers = async (projectId) => {
  const token = getAccessToken();
  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  if (!projectId) {
    console.error("❌ projectId가 없습니다. 팀원 조회 요청 취소");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/members`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("팀원 조회 실패");

    const data = await response.json();
    console.log("✅ 팀원 목록 조회 성공:", data);

    // 🔥 상태에 저장
    setProjectMembers((prev) => ({
      ...prev,
      [selectedProject]: data,
    }));
  } catch (error) {
    console.error("❌ 팀원 조회 오류:", error);
  }
};
  
  useEffect(() => {
    setProjects((prev) => {
      if (!prev.includes(defaultProject)) {
        return [defaultProject, ...prev];
      }
      return prev;
    });

    setProjectData((prev) => {
      if (!prev[defaultProject]) {
        return {
          ...prev,
          [defaultProject]: { events: {}, todoLists: {} },
        };
      }
      return prev;
    });

    setSelectedProject(defaultProject);
  }, [defaultProject]);

  

// ✅ 프로젝트 추가 기능
const handleCreateProject = () => {
  if (newProjectName.trim() !== "" && !projects.includes(newProjectName)) {
    setProjects([...projects, newProjectName]);
    setProjectData({
      ...projectData,
      [newProjectName]: { events: {}, todoLists: {}, color: "#ccf0ff" }, // 🔥 프로젝트 색상 추가
    });
    setSelectedProject(newProjectName);
    closeProjectModal();
  }
};

const closeProjectModal = () => {
  setIsProjectModalOpen(false);
  setNewProjectName("");
};

useEffect(() => {
  console.log("페이지가 정상적으로 라우팅되는지 확인");
}, []);

// useEffect(() => {
//   if (!selectedProject) return;

//   if (selectedProject === defaultProject) {
//     // 🟢 메인 프로젝트 → 병합
//     let mergedEvents = {};

//     Object.keys(projectData).forEach((project) => {
//       const projectEvents = projectData[project]?.events || {};
//       Object.keys(projectEvents).forEach((dateKey) => {
//         if (!mergedEvents[dateKey]) mergedEvents[dateKey] = [];
//         mergedEvents[dateKey] = [
//           ...mergedEvents[dateKey],
//           ...projectEvents[dateKey].map((event) => ({
//             ...event,
//             color: projectData[project]?.color || "#FFCDD2",
//           })),
//         ];
//       });
//     });

//     if (JSON.stringify(events) !== JSON.stringify(mergedEvents)) {
//       setEvents(mergedEvents);
//     }

//   } else {
//     // 🔵 일반 프로젝트
//     const projectEvents = projectData[selectedProject]?.events || {};

//     const coloredEvents = Object.fromEntries(
//       Object.entries(projectEvents).map(([date, eventList]) => [
//         date,
//         eventList.map(event => ({
//           ...event,
//           color: projectData[selectedProject]?.color || "#FFCDD2",
//         }))
//       ])
//     );

//     if (JSON.stringify(events) !== JSON.stringify(coloredEvents)) {
//       setEvents(coloredEvents);
//     }
//   }
// }, [projectData, selectedProject]);
useEffect(() => {
  if (!selectedProject) return;

  // ✅ 모든 프로젝트의 일정이 준비됐는지 확인
  const allProjectsHaveEvents = projects.every(project =>
    projectData[project]?.events
  );

  if (selectedProject === defaultProject && allProjectsHaveEvents) {
    let mergedEvents = {};

    Object.keys(projectData).forEach((project) => {
      const projectEvents = projectData[project]?.events || {};
      Object.keys(projectEvents).forEach((dateKey) => {
        if (!mergedEvents[dateKey]) mergedEvents[dateKey] = [];
        mergedEvents[dateKey] = [
          ...mergedEvents[dateKey],
          ...projectEvents[dateKey].map((event) => ({
            ...event,
            color: projectData[project]?.color || "#FFCDD2",
          })),
        ];
      });
    });

    setEvents(mergedEvents);
  } else if (selectedProject !== defaultProject) {
    const projectEvents = projectData[selectedProject]?.events || {};
    const coloredEvents = Object.fromEntries(
      Object.entries(projectEvents).map(([date, eventList]) => [
        date,
        eventList.map(event => ({
          ...event,
          color: projectData[selectedProject]?.color || "#FFCDD2",
        }))
      ])
    );
    setEvents(coloredEvents);
  }
}, [projectData, selectedProject, projects]);





const addTodo = async (title, selectedDate) => {
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return null;
  }

  const date = formatDateToYYYYMMDD(selectedDate);
  const body = { title: newTitle };

  try {
    let url = `https://calendo.site/api/todos/add`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("투두 추가 실패");
    const result = await response.json();
    console.log("✅ 투두 추가 성공:", result);
    return result.todo || result; // 혹시 result.todo 형태로 감싸져 있다면
  } catch (error) {
    console.error("❌ 투두 추가 오류:", error);
    return null;
  }

};



  const currentTodoLists = selectedProject === defaultProject
    ? Object.values(projectData).reduce((acc, project) => {
        Object.keys(project.todoLists || {}).forEach((date) => {
          acc[date] = [...(acc[date] || []), ...project.todoLists[date]];
        });
        return acc;
      }, {})
    : projectData[selectedProject]?.todoLists || {};


    // ✅ 드롭다운 토글
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // ✅ 프로젝트 선택
  const handleProjectChange = (project) => {
    setSelectedProject(project);
    setDropdownOpen(false);
    setSelectedColor(projectData[project]?.color || "#FFCDD2"); // 🔥 선택한 프로젝트 색상 적용
  };

  // 일정 선택 상태 추가
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  // 📌 시간 설정 클릭 시 모달 열기
  const handleOpenDateTimePicker = () => {
    setIsDateTimePickerOpen(true);
  };

  // 📌 날짜 포맷 함수 추가
const formatDateRange = (startDate, endDate) => {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  
  const formatSingleDate = (date) => {
    return `${date.getMonth() + 1}월 ${date.getDate()}일(${daysOfWeek[date.getDay()]})`;
  };

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatSingleDate(startDate); // 하루만 선택한 경우
  } else {
    return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`; // 여러 날짜 선택한 경우
  }
};

 // 📌 선택 완료 후 적용 (시간만 저장)
const handleDateTimeSelection = () => {
  const formattedStartTime = selectedStartTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedEndTime = selectedEndTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // ⏰ 날짜 제외하고 시간만 저장
  setSelectedTime(`${formattedStartTime} - ${formattedEndTime}`);

  setIsDateTimePickerOpen(false);
};



const handleEditTodo = (todo, index) => {
  setNewTitle(todo.title);
  setEventType("To-do");
  setSelectedColor(todo.color || "#FFCDD2"); // 색상 기본값 설정
  setSelectedTime(todo.time || "");
  setRepeatOption(todo.repeat || "none");
  setAlertOption(todo.alert || "이벤트 당일(오전 9시)");
  setEditingIndex(index); // 현재 수정 중인 To-do 인덱스 설정
  setIsModalOpen(true);
};

  const userId = localStorage.getItem("userId"); // ✅ 사용자 ID 가져오기


  // ✅ 색상 변경 관련 통합 정리

const [isSavingColor, setIsSavingColor] = useState(false);
// ✅ 메인 테마 색상 변경 (POST /change-theme)
const updateMainThemeColor = async (newColor) => {
  console.log("🎯 updateMainThemeColor 호출됨:", newColor);
  if (isSavingColor) return;

  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  setIsSavingColor(true);
  try {
    const response = await fetch(`https://calendo.site/change-theme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ color: newColor }),
      withCredentials: true, 
    });

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`색상 변경 실패: ${errorText}`);
    }

    console.log("✅ 메인 테마 색상 변경 성공");
    localStorage.setItem("mainThemeColor", newColor); // 메인 색상 저장

    // ✅ 상태 반영 (projectData에 저장)
    setProjectData((prev) => ({
      ...prev,
      [defaultProject]: {
        ...prev[defaultProject],
        color: newColor,
        events: Object.fromEntries(
          Object.entries(prev[defaultProject]?.events || {}).map(([date, eventList]) => [
            date,
            eventList.map(event => ({ ...event, color: newColor })),
           
          ])
        )
      }
    }));

    // ✅ events도 갱신
    setEvents((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([date, eventList]) => [
          date,
          eventList.map(event => ({ ...event, color: newColor })),
        ])
      )
    );
  } catch (error) {
    console.error("메인 테마 색상 변경 오류:", error);
  } finally {
    setIsSavingColor(false);
  }
};



// ✅ 프로젝트 테마 색상 변경 (PUT /api/projects/{projectId}/mainTheme)
const updateProjectThemeColor = async (projectId, newColor) => {
  const token = getAccessToken();

                console.log("🎯 updateProjectThemeColor 실행");
                console.log("🟢 보낼 토큰:", token);
                console.log("🟡 프로젝트 ID:", projectId);
                console.log("🟣 새 색상:", newColor);

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/mainTheme`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ temaColor: newColor }),
      credentials: "include",
    });

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    if (!response.ok) throw new Error("프로젝트 테마 색상 변경 실패");

    const result = await response.json();
    console.log("✅ 프로젝트 테마 색상 변경 성공:", result);
    localStorage.setItem(`projectColor_${projectId}`, newColor); // 프로젝트별 색상 저장

    setProjectData((prev) => ({
      ...prev,
      [selectedProject]: {
        ...prev[selectedProject],
        color: result.newColor,
      },
    }));

    setEvents((prev) => {
      return Object.fromEntries(
        Object.entries(prev).map(([date, eventList]) => [
          date,
          eventList.map(event =>
            event.color === result.oldColor ? { ...event, color: result.newColor } : event
          ),
        ])
      );
    });
  } catch (error) {
    console.error("프로젝트 테마 색상 변경 오류:", error);
  }
};


// ✅ 프로젝트 테마 색상 조회 (GET /api/projects/{projectId}/mainTheme)
const fetchProjectThemeColor = async (projectId) => {
  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/mainTheme`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    if (!response.ok) throw new Error("프로젝트 테마 색상 조회 실패");

    const data = await response.json();

    if (data.color) {
      setSelectedColor(data.color);

      setEvents((prev) => {
        return Object.fromEntries(
          Object.entries(prev).map(([date, eventList]) => [
            date,
            eventList.map(event => ({ ...event, color: data.color })),
          ])
        );
      });

      setProjectData((prev) => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          color: data.color,
        },
      }));
    }
  } catch (error) {
    console.error("프로젝트 테마 색상 조회 오류:", error);
  }
};

// ✅ 색상 변경 핸들러 (메인 or 프로젝트 판단)
const handleColorChange = async (e) => {
  const newColor = e.target.value;
  setSelectedColor(newColor);

  console.log("🎨 선택된 프로젝트:", selectedProject);
  console.log("🎨 기본 프로젝트 이름:", defaultProject);

  if (selectedProject === defaultProject) {
    console.log("🟠 메인 색상 변경 로직 실행");
    await updateMainThemeColor(newColor);
  } else {
    const projectId = projectData[selectedProject]?.id;
    console.log("🔵 프로젝트 색상 변경 로직 실행, projectId:", projectId);
    if (!projectId) {
      console.error("❌ 유효한 프로젝트 ID가 없습니다:", selectedProject);
      return;
    }
    await updateProjectThemeColor(projectId, newColor);
  }
};

useEffect(() => {
  if (selectedProject === defaultProject) {
    const savedColor = localStorage.getItem("mainThemeColor");
    if (savedColor) setSelectedColor(savedColor);
  } else {
    const projectId = projectData[selectedProject]?.id;
    if (projectId) {
      const savedColor = localStorage.getItem(`projectColor_${projectId}`);
      if (savedColor) {
        setSelectedColor(savedColor);
      } else {
        fetchProjectThemeColor(projectId); // 백업: 서버에서 불러오기
      }
    }
  }
}, [selectedProject]);


  useEffect(() => {
    // ✅ `localStorage`에서 닉네임 가져오기
    const storedNickname = localStorage.getItem("nickname") || "unknown";
    setNickname(`${storedNickname}의 일정`);
  }, []);
  
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const toggleMemberDropdown = () => {
    setIsMemberDropdownOpen(!isMemberDropdownOpen);
  };
 

  const handleAddMember = async () => {
    const token = localStorage.getItem("access-token") ||
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("jwt_token");
  
    const inviteNickname = prompt("초대할 팀원의 닉네임을 입력하세요:");
    if (!inviteNickname) return alert("닉네임을 입력해야 합니다.");
  
    // 프로젝트 ID 가져오기
    const projectId = projectData[selectedProject]?.id;
    if (!projectId) {
      console.error("❌ 프로젝트 ID를 찾을 수 없습니다.");
      alert("프로젝트 정보를 찾을 수 없습니다.");
      return;
    }
  
    try {
      const response = await fetch(`https://calendo.site/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickName: inviteNickname,  // ✅ 닉네임으로 초대
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 실패: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log("✅ 팀원 초대 성공:", result);
      alert("팀원이 성공적으로 초대되었습니다!");
    } catch (error) {
      console.error("❌ 팀원 초대 실패:", error);
      alert("팀원 초대에 실패했습니다. 닉네임을 확인해주세요.");
    }
  };
  
  


  const formatDateToYYYYMMDD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDateKey = (dateStr) => {
    const date = new Date(dateStr);
    return date.toDateString(); // 'Fri Mar 14 2025'
  };

  //일정 조회
  const fetchEventsForDate = async (date) => {
    const formattedDate = formatDateToYYYYMMDD(date);
 
    const dateKey = new Date(date).toDateString();
    console.log("📅 클릭한 날짜:", formattedDate);
    console.log("🕐 원본 date 객체:", date);
    const token = getAccessToken();
  
    if (!token) {
      console.error("❌ Access Token이 없습니다!");
      return;
    }
  
    const url = `https://calendo.site/api/schedules?date=${formattedDate}`;
    console.log("📅 클릭한 날짜:", formattedDate);
    console.log("📌 요청 주소:", url);
    console.log("📌 보낼 토큰:", token);
  
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("일정 불러오기 실패");
  
      const data = await response.json();

      // ✅ 여기다가 넣어줘
      console.log("📦 전체 응답 데이터:", data);
      // ✅ 여기서 바로 data를 사용해야 함
      const fetchedEvents = (data || []).map((schedule) => ({
        ...schedule,
        id: schedule.id,
        type: "Schedule",
        color: projectData[defaultProject]?.color || "#FFCDD2",
        time: formatTime(schedule.startDateTime),
      }));

      console.log("✅ 조회한 일정 데이터:", fetchedEvents);

      
       // 👉 메인 projectData에도 반영
      // setProjectData((prev) => ({
      //   ...prev,
      //   [defaultProject]: {
      //     ...prev[defaultProject],
      //     events: {
      //       ...prev[defaultProject].events,
      //       [dateKey]: fetchedEvents,
      //     },
      //   },
      // }));
      setProjectData((prev) => ({
        ...prev,
        [selectedProject]: {
          ...prev[selectedProject],
          events: {
            ...prev[selectedProject].events,
            [dateKey]: fetchedEvents,
          },
        },
      }));

      // 일정 상태 반영
      setEvents((prev) => {
        const updated = {
          ...prev,
          [dateKey]: fetchedEvents,
        };
        console.log("📅 저장할 dateKey:", dateKey);
        console.log("🧾 전체 events 상태:", updated);
        return updated;
      })
    } catch (error) {
      console.error("일정 불러오기 오류:", error);
    }
  };

  
  
  // 🔧 시간 포맷 변환 함수 (예: "22:32" → "10:32 PM")
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  
const handleDayClick = async (date) => {
    console.log("📌 handleDayClick 호출됨:", date);

  setSelectedDate(date);
  const dateKey = date.toDateString();

  if (selectedProject === defaultProject) {
    // ✅ 메인 일정 조회 함수 호출
    await fetchEventsForDate(date);
  } else {
    // ✅ 프로젝트 일정 조회 함수 호출
    const projectId = projectData[selectedProject]?.id;
    if (!projectId) {
      console.warn("❌ 프로젝트 ID가 없습니다:", selectedProject);
      return;
    }

    const schedules = await fetchProjectSchedulesByDate(projectId, date);

    // 👉 프로젝트 일정 상태 저장
    setProjectData((prev) => ({
      ...prev,
      [selectedProject]: {
        ...prev[selectedProject],
        events: {
          ...prev[selectedProject]?.events,
          [dateKey]: schedules,
        },
      },
    }));

    setEvents((prev) => ({
      ...prev,
      [dateKey]: schedules,
    }));
  }

  // ✅ 공통: To-do 조회
  fetchTodosForDate(date);
};


//일정 수정
const updateEvent = async (scheduleId, updatedEvent) => {
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  // 백엔드 요구 형식: '2025-03-22T17:00:00'
  const toISOStringWithoutSeconds = (date, time) => {
    const [hour, minute] = time.split(":");
    const dt = new Date(date);
    dt.setHours(Number(hour), Number(minute), 0, 0);
    return dt.toISOString().slice(0, 19);
  };

  const formData = {
    title: updatedEvent.title,
    startDateTime: toISOStringWithoutSeconds(updatedEvent.date, updatedEvent.startTime),
    endDateTime: toISOStringWithoutSeconds(updatedEvent.date, updatedEvent.endTime),
    repeatType: updatedEvent.repeatType || "NONE"
  };

  try {
    const response = await fetch(`https://calendo.site/api/schedules/update/${scheduleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error("일정 수정 실패");

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log("✅ 일정 수정 성공 (JSON):", result);
    } else {
      const text = await response.text();
      console.log("✅ 일정 수정 성공 (문자열):", text);
    }


    // 필요한 후처리: 모달 닫기, 일정 새로고침 등
  } catch (error) {
    console.error("❌ 일정 수정 오류:", error);
  }
};



const fetchTodosForDate = async (date) => {
  const formattedDate = formatDateToYYYYMMDD(date); // "2025-02-08" 형태로 변환
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/todos?date=${formattedDate}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("투두 조회 실패");

    const data = await response.json();

    console.log("✅ 투두 조회 성공:", data);

    // 상태에 저장
    setTodoLists((prev) => ({
      ...prev,
      [date.toDateString()]: data
    }));
  } catch (error) {
    console.error("❌ 투두 조회 오류:", error);
  }
};



const updateTodo = async (todoId, updatedTitle) => {
  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/todos/update/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title: updatedTitle }),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 투두 수정 실패:", errorText);
      return;
    }

    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log("✅ 투두 수정 성공 (JSON):", result);
    } else {
      const text = await response.text();
      console.log("✅ 투두 수정 성공 (문자열):", text);
    }
  } catch (error) {
    console.error("❌ 투두 수정 오류:", error);
  }
};

//프로젝트 일정 추가
const addProjectSchedule = async (projectId, scheduleData) => {

  const token = getAccessToken();
  console.log("📨 프로젝트 일정 추가 요청:", projectId, scheduleData);


  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 프로젝트 일정 추가 실패:", response.status, errorText);
      throw new Error("프로젝트 일정 추가 실패");
    }
  
    const result = await response.json();
    const schedule = result.schedule || result;
    console.log("✅ 프로젝트 일정 추가 성공:", result);

  
  return {
    ...schedule,
    id: schedule.projectScheduleId || schedule.id || Date.now(), // 🔥 여기가 핵심!
  };
} catch (error) {
  console.error("❌ 프로젝트 일정 추가 오류:", error);
  return null;
}
};

//프로젝트 일정 수정
const updateProjectSchedule = async (projectId, scheduleId, updatedData) => {
  const token = getAccessToken();
  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/schedules/${scheduleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("프로젝트 일정 수정 실패");

    const contentType = response.headers.get("content-type");
    if (contentType.includes("application/json")) {
      const result = await response.json();
      console.log("✅ 프로젝트 일정 수정 성공:", result);
    } else {
      const text = await response.text();
      console.log("✅ 프로젝트 일정 수정 성공:", text);
    }

  } catch (error) {
    console.error("❌ 프로젝트 일정 수정 오류:", error);
  }
};

//프로젝트 일정 삭제
const deleteProjectSchedule = async (projectId, scheduleId) => {
  const token = getAccessToken();

  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("프로젝트 일정 삭제 실패");

    console.log("✅ 프로젝트 일정 삭제 성공:", scheduleId);
  } catch (error) {
    console.error("❌ 프로젝트 일정 삭제 오류:", error);
  }
};

//프로젝트 일정 조회(한개)
const fetchProjectSchedulesByDate = async (projectId, date) => {
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  const formattedDate = formatDateToYYYYMMDD(date); // 예: 2025-03-30
  console.log("📅 클릭한 날짜:", formattedDate);
  console.log("🕐 원본 date 객체:", date);
  const url = `https://calendo.site/api/projects/${projectId}/schedules/date?date=${formattedDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`일정 조회 실패: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ 프로젝트 일정 조회 성공:", data);

    return data.schedules || data; // 백엔드 구조에 따라 다름
  } catch (error) {
    console.error("❌ 프로젝트 일정 조회 오류:", error);
    return [];
  }
};


//프로젝트 일정 목록 조회(여러개)
const fetchProjectSchedules = async (projectId) => {
  const token = getAccessToken();

  try {
    const response = await fetch(`https://calendo.site/api/projects/${projectId}/schedules`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.status === 204) {
      console.warn("📭 일정 없음 (204 No Content)");
      return [];
    }
    
    if (!response.ok) throw new Error("프로젝트 일정 목록 조회 실패");
    const text = await response.text();
    if (!text) {
      console.warn("⚠️ 프로젝트 일정 응답이 비어있음");
      return [];
    }
    const data = JSON.parse(text); // 🔥 수동 파싱

    console.log("✅ 프로젝트 일정 목록 조회 성공:", data);
    return data; // 배열 or 객체

  } catch (error) {
    console.error("❌ 프로젝트 일정 목록 조회 오류:", error);
    return null;
  }
};

const fetchMainSchedulesForMonth = async (year, month) => {
  const token = getAccessToken();
  if (!token) {
    console.warn("❌ 토큰 없음 (fetchMainSchedulesForMonth)");
    return;
  }

  const promises = [];

  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break; // 다음 달로 넘어가면 종료

    promises.push(fetchEventsForDate(date));
  }

  try {
    await Promise.all(promises); // 병렬 처리
    console.log("✅ 한 달 일정 모두 로딩 완료");
  } catch (err) {
    console.error("❌ 월간 일정 불러오기 실패:", err);
  }
};



const openModal = () => {
  setSelectedStartDate(selectedDate); // 선택한 날짜를 기본 시작 날짜로 설정
  setSelectedEndDate(selectedDate); // 종료 날짜도 동일하게 설정
  setIsModalOpen(true);
};

  const closeModal = () => {
    setIsModalOpen(false);
    resetModalFields();
  };

  const resetModalFields = () => {
    setNewTitle("");
    setEventType("Schedule");
    setSelectedTime("");
    setRepeatOption("none");
    setAlertOption("이벤트 당일(오전 9시)");
  };

  const handleEditEvent = (event, index) => {
    console.log("🔍 선택한 일정 데이터:", event);
  
    if (!event.id) {
      console.error("❌ 수정하려는 일정에 ID가 없습니다!", event);
      alert("이 일정은 아직 저장되지 않아 수정할 수 없습니다.");
      return;
    }

    setNewTitle(event.title);
    setEventType(event.type || "Schedule");
    setSelectedColor(event.color || "#FFCDD2");

    // 🕒 시간 파싱
  if (event.startDateTime && event.endDateTime) {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    setSelectedStartTime(start);
    setSelectedEndTime(end);

    // 시간 문자열로도 저장 (모달에 표시용)
    const formattedStart = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const formattedEnd = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setSelectedTime(`${formattedStart} - ${formattedEnd}`);
  }

  setRepeatOption((event.repeatType || event.repeat || "none").toLowerCase());
  setAlertOption(event.alert || "이벤트 당일(오전 9시)");
  setEditingIndex(index);
  setIsModalOpen(true);

  };
  

const openProjectModal = () => {
  setIsProjectModalOpen(true);
};

// 이전 달로 이동
const handlePrevMonth = () => {
  setSelectedDate((prevDate) => {
    const prevMonth = new Date(prevDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth;
  });
};

// 다음 달로 이동
const handleNextMonth = () => {
  setSelectedDate((prevDate) => {
    const nextMonth = new Date(prevDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  });
};

useEffect(() => {
  if (selectedProject === defaultProject) {
    const today = new Date();
    fetchMainSchedulesForMonth(today.getFullYear(), today.getMonth()); // ✅ 이거!
  }
}, [selectedProject]);



const handleSave = async () => {
  let currentDate = new Date(selectedStartDate);
  const endDate = new Date(selectedEndDate);
  let updatedEvents = { ...projectData[selectedProject]?.events };
  let updatedTodos = { ...todoLists };

  const toISOStringWithoutSeconds = (date, time) => {
    if (typeof time !== "string") {
      console.error("❌ 시간 값이 문자열이 아님:", time);
      return "";
    }
    const [hour, minute] = time.split(":");
    const dt = new Date(date);
    dt.setHours(Number(hour), Number(minute), 0, 0);
    return dt.toISOString().slice(0, 19);
  };

  while (currentDate <= endDate) {
    const dateKey = currentDate.toDateString();
    const newItem = {
      title: newTitle,
      type: eventType,
      color: projectData[selectedProject]?.color || "#FFCDD2",
      time: selectedTime,
      repeat: repeatOption,
      alert: alertOption,
      completed: false,
    };

    if (eventType === "Schedule") {
      if (editingIndex !== null) {
        if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
        const eventList = selectedProject === defaultProject
        ? events[dateKey] || []
        : projectData[selectedProject]?.events[dateKey] || [];
        const existing = eventList[editingIndex];

        if (existing?.id) {
          const startTime = selectedStartTime instanceof Date ? formatToHHMM(selectedStartTime) : selectedStartTime;
          const endTime = selectedEndTime instanceof Date ? formatToHHMM(selectedEndTime) : selectedEndTime;

          const updated = {
            ...newItem,
            id: existing.id,
            date: selectedStartDate,
            startTime,
            endTime,
            repeatType: repeatOption?.toUpperCase() || "NONE",
          };

          if (selectedProject === defaultProject) {
            // ✅ 메인 일정 수정
            await updateEvent(existing.id, updated);
            await fetchEventsForDate(selectedStartDate); // ✅ 메인 일정 다시 로딩

          } else {
            
            // ✅ 프로젝트 일정 수정
            const projectId = projectData[selectedProject]?.id;
          

            if (!projectId) {
              console.error("❌ 프로젝트 ID 없음 - 프로젝트 일정 수정 중단");
            } else {
              const updatedScheduleData = {
                title: newTitle,
                startDateTime: toISOStringWithoutSeconds(selectedStartDate, startTime),
                endDateTime: toISOStringWithoutSeconds(selectedStartDate, endTime),
                repeatType: repeatOption?.toUpperCase() || "NONE"
              };
              await updateProjectSchedule(projectId, existing.id, updatedScheduleData);
            }
          }
          // ✅ 화면 반영
          updatedEvents[dateKey][editingIndex] = { ...existing, ...newItem };
        } else {
          console.warn("❌ 기존 일정에 ID 없음:", existing);
        }

      }  else {
        const startTimeStr = typeof selectedStartTime === "string"
          ? selectedStartTime
          : formatToHHMM(selectedStartTime);
      
        const endTimeStr = typeof selectedEndTime === "string"
          ? selectedEndTime
          : formatToHHMM(selectedEndTime);
      
        const formattedStart = toISOStringWithoutSeconds(selectedStartDate, startTimeStr);
        const formattedEnd = toISOStringWithoutSeconds(selectedStartDate, endTimeStr);
      
        let added;
      
        if (selectedProject === defaultProject) {
          // ✅ 메인 일정 추가
          added = await addEvent();
        } else {
          const token = getAccessToken();
          console.log("🛂 토큰 확인:", token);

          // ✅ 프로젝트 일정 추가
          const projectId = projectData[selectedProject]?.id;
          if (!projectId) {
            console.error("❌ 프로젝트 ID 없음 - 프로젝트 일정 추가 중단");
            return;
          }
          console.log("🧪 addProjectSchedule 호출 준비", selectedProject, projectData[selectedProject]);
          added = await addProjectSchedule(projectId, {
            title: newTitle,
            startDateTime: formattedStart,
            endDateTime: formattedEnd,
            repeatType: repeatOption?.toUpperCase() || "NONE"
          });
          console.log("📨 addProjectSchedule 호출됨");

        } 

        if (added) {
          // ✅ 프로젝트 일정 추가 후 스케줄 객체 꺼냄
          const addedSchedule = added.schedule ?? added;
          const updatedItem = {
            id: addedSchedule.projectScheduleId || addedSchedule.id || Date.now(), // 🔥 중요
            title: addedSchedule.title,
            startDateTime: addedSchedule.startDateTime,
            endDateTime: addedSchedule.endDateTime,
            type: "Schedule",
            color: projectData[selectedProject]?.color || "#FFCDD2",
            time: selectedTime,
            repeat: repeatOption,
            alert: alertOption,
            completed: false,
          };

          if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
          updatedEvents[dateKey].push(updatedItem);
        }

        const createRepeatItem = (dateObj) => ({
          ...newItem,
          id: null, // ❌ 없는 상태로는 수정 안됨
          date: dateObj.toISOString().slice(0, 10),
        });
        

        if (repeatOption === "weekly") {
          for (let i = 1; i <= 10; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + i * 7);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push(createRepeatItem(nextDate));
          }
        }

        if (repeatOption === "monthly") {
          for (let i = 1; i <= 12; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setMonth(nextDate.getMonth() + i);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push(createRepeatItem(nextDate));
          }
        }

        if (repeatOption === "yearly") {
          for (let i = 1; i <= 5; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setFullYear(currentDate.getFullYear() + i);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push(createRepeatItem(nextDate));
          }
        }
      }

      setEvents(updatedEvents);
    } else if (eventType === "To-do") {
      if (!updatedTodos[dateKey]) updatedTodos[dateKey] = [];

      if (editingIndex !== null) {
        const todoToUpdate = updatedTodos[dateKey][editingIndex];
        if (!todoToUpdate.id) {
          console.error("❌ 수정할 투두에 ID가 없습니다:", todoToUpdate);
          return;
        }
        await updateTodo(todoToUpdate.id, newTitle);
        updatedTodos[dateKey][editingIndex] = {
          ...todoToUpdate,
          title: newTitle
        };
        setEditingIndex(null);
      } else {
        const addedTodo = await addTodo(newTitle, selectedDate);
        if (addedTodo && addedTodo.id) {
          const newTodoItem = {
            id: addedTodo.id,
            title: addedTodo.title,
            checked: addedTodo.checked,
            userId: addedTodo.userId,
            type: "To-do",
            color: projectData[selectedProject]?.color || "#FFCDD2",
            time: selectedTime,
            repeat: repeatOption,
            alert: alertOption,
            completed: addedTodo.checked || false
          };
          updatedTodos[dateKey].push(newTodoItem);
        } else {
          console.error("❌ 추가된 투두에 ID가 없습니다:", addedTodo);
        }
      }

      setTodoLists(updatedTodos);
      setProjectData((prev) => ({
        ...prev,
        [selectedProject]: {
          ...prev[selectedProject],
          todoLists: {
            ...prev[selectedProject]?.todoLists,
            [dateKey]: updatedTodos[dateKey],
          },
        },
      }));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  setProjectData((prev) => ({
    ...prev,
    [selectedProject]: {
      ...prev[selectedProject],
      events: updatedEvents,
    },
  }));

  closeModal();
};



const formatToHHMM = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

//일정 추가
const addEvent = async () => {
  console.log("🟡 addEvent() 호출됨");
  console.log("🕒 시작일:", selectedStartDate);
  console.log("🕒 시작시간:", selectedStartTime);

  const token = getAccessToken();


  // 🛠️ 시간 값이 Date 객체이면 문자열로 변환
  const startTimeStr = typeof selectedStartTime === "string" 
    ? selectedStartTime 
    : formatToHHMM(selectedStartTime);

  const endTimeStr = typeof selectedEndTime === "string" 
    ? selectedEndTime 
    : formatToHHMM(selectedEndTime);

  const toISOStringWithoutSeconds = (date, time) => {
    if (typeof time !== "string" || !time.includes(":")) {
      console.error("❌ 시간 문자열이 아닙니다:", time);
      return "";
    }

    const [hour, minute] = time.split(":");
    const dt = new Date(date);
    dt.setHours(Number(hour), Number(minute), 0, 0); // 초 0으로 고정
    return dt.toISOString().slice(0, 19); // 예: "2025-03-22T17:00:00"
  };

  const formattedStart = toISOStringWithoutSeconds(selectedStartDate, startTimeStr);
  const formattedEnd = toISOStringWithoutSeconds(selectedStartDate, endTimeStr);

  if (!formattedStart || !formattedEnd) {
    console.error("❌ 시간 포맷 오류");
    return;
  }

  const newSchedule = {
    title: newTitle,
    startDateTime: formattedStart,
    endDateTime: formattedEnd,
    repeatType: repeatOption?.toUpperCase() || "NONE"
  };

  try {
    const response = await fetch("https://calendo.site/add-schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newSchedule)
    });

    if (!response.ok) throw new Error("일정 추가 실패");

    const result = await response.json();
    console.log("✅ 일정 추가 성공:", result);
    // 메인 일정 응답에서 id가 없을 경우 임시 id 생성
    const schedule = result.schedule || {};
    const finalId = schedule.id ?? schedule.scheduleId ?? Date.now(); // 혹시 다른 필드에 들어있을 수도 있으니 점검

    if (!schedule.id) {
      console.warn("⚠️ 반환된 일정에 id 없음. 임시 id 사용:", finalId);
    }

    return {
      ...schedule,
      id: finalId, // 반드시 id가 들어가도록 강제
    };
  } catch (error) {
    console.error("❌ 일정 추가 오류:", error);
    return null;
  }

};


// ✅ 일정 삭제 핸들러 분기 추가
const handleDelete = async (item, isTodo) => {
  if (!item?.id) {
    console.error("❌ 삭제할 항목의 ID가 없습니다. 데이터 확인 필요:", item);
    return;
  }
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  const dateKey = selectedDate.toDateString();

  try {
    if (isTodo) {
      // 🟩 To-do 삭제
      const response = await fetch(`https://calendo.site/api/todos/toggle/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("삭제 실패:", errorMessage);
        throw new Error(errorMessage);
      }
      console.log("✅ To-do 삭제 성공:", item.id); // ✅ 로그 추가

      setTodoLists((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].filter((todo) => todo.id !== item.id),
      }));

    } else {
      // 🟦 일정 삭제 (메인 or 프로젝트 여부 확인)
      if (deleteConfirm.isMain) {
        // ✅ 메인 일정 삭제
        const response = await fetch(`https://calendo.site/delete-schedule/${item.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          console.error("삭제 실패:", errorMessage);
          throw new Error(errorMessage);
        }

        console.log("✅ 메인 일정 삭제 성공:", item.id); // ✅ 여기 로그 추가

        setEvents((prev) => ({
          ...prev,
          [dateKey]: prev[dateKey].filter((event) => event.id !== item.id),
        }));

      } else {
        // ✅ 프로젝트 일정 삭제
        const projectId = projectData[selectedProject]?.id;
        if (!projectId) {
          console.error("❌ 프로젝트 ID가 없습니다. 삭제 중단");
          return;
        }

        await deleteProjectSchedule(projectId, item.id);


        console.log("✅ 프로젝트 일정 삭제 성공:", item.id); // ✅ 이미 있음

        setEvents((prev) => ({
          ...prev,
          [dateKey]: prev[dateKey].filter((event) => event.id !== item.id),
        }));
      }
    }
  } catch (error) {
    console.error("삭제 오류:", error);
  }

  setDeleteConfirm({ show: false, item: null, isTodo: false });
};



const toggleTodo = async (todo) => {
  const dateKey = selectedDate.toDateString();
  const token = getAccessToken();

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  try {
    const response = await fetch(`https://calendo.site/api/todos/toggle/${todo.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "토글 실패");
    }

    console.log("✅ 투두 삭제 성공:", todo.id);

    // 클라이언트 상태 반영
    setProjectData((prev) => {
      const updatedTodos = (prev[selectedProject]?.todoLists[dateKey] || []).map((t) =>
        t.id === todo.id ? { ...t, checked: !t.checked, completed: !t.checked } : t
      );

      return {
        ...prev,
        [selectedProject]: {
          ...prev[selectedProject],
          todoLists: {
            ...prev[selectedProject]?.todoLists,
            [dateKey]: updatedTodos,
          },
        },
      };
    });

    // 전역 투두 상태도 갱신
    setTodoLists((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((t) =>
        t.id === todo.id ? { ...t, checked: !t.checked, completed: !t.checked } : t
      ),
    }));
  } catch (error) {
    console.error("❌ 투두 토글 오류:", error);
  }
};



  return (
    <div className="schedule-container">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar-left" >
          <img src={teammemberIcon} className="icon"  onClick={toggleMemberDropdown} />
        {/* 팀원 목록 드롭다운 */}
  {isMemberDropdownOpen && (
    <div className="member-dropdown">
      {(projectMembers[selectedProject] || []).map((member, index) => {
        console.log("👤 팀원 정보:", member); // 🔍 콘솔에 팀원 정보 출력
        return (
          <div key={index} className="member-item">
            {member.nickName || member.name || member.email}
          </div>
        );
      })}
      <div className="member-item invite" onClick={handleAddMember}>
        팀원 초대  <img src={addMemberIcon}  className="spaced-icon" />
      </div>
    </div>
  )}
  <div className="dropdown-container">
    <button className="dropdown-toggle" onClick={toggleDropdown}>
              {selectedProject} ▼
            </button>
            {dropdownOpen && (
            <div className="dropdown-menu">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleProjectChange(project)}
                >
                  {project}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ 캘린더 색상 선택 버튼 추가 */}
        <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className="color-picker"
          />
        </div>
        
        <div className="app-bar-right">
          <img src={alertIcon} className="icon" onClick={() => navigate("/alert")}/>
          <img src={addProjectIcon} className="icon" onClick={() => navigate("/invite")} />
          <img
  src={timeIcon}
  className="icon"
  onClick={async () => {
    const selectedProjectId = projectData[selectedProject]?.id;
    const token = localStorage.getItem("accessToken");
    const nickname = JSON.parse(localStorage.getItem("user"))?.email?.split("@")[0];

    if (!selectedProjectId || !token || !nickname) {
      alert("프로젝트 또는 사용자 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      // 🔍 최신 타임테이블 가져오기
      const latestRes = await fetch(
        `https://calendo.site/api/projects/${selectedProjectId}/available_times/latest-timetable`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!latestRes.ok) throw new Error("타임테이블 조회 실패");

      const { timetableId } = await latestRes.json();

      if (!timetableId) {
        navigate("/plan", { state: { projectId: selectedProjectId } });
        return;
      }

      // 🔍 해당 타임테이블의 닉네임 목록 조회
      const detailRes = await fetch(
        `https://calendo.site/api/projects/${selectedProjectId}/available_times/timetable/${timetableId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!detailRes.ok) throw new Error("상세 타임테이블 조회 실패");

      const detailData = await detailRes.json();
      const checkedNicknames = detailData.checkedNicknames || [];

      if (checkedNicknames.includes(nickname)) {
        navigate(`/check-time/${selectedProjectId}/${timetableId}`);
      } else {
        navigate("/plan", { state: { projectId: selectedProjectId } });
      }
    } catch (error) {
      console.error("타임테이블 확인 실패:", error);
      alert("타임테이블을 확인하는 데 실패했습니다.");
      navigate("/plan", { state: { projectId: selectedProjectId } });
    }
  }}
/>


          <img src={profileIcon} className="icon" onClick={() => navigate("/mypage")} />
        
        </div>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onRequestClose={closeProjectModal}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-header">
        <button className="close-btn" onClick={closeProjectModal}> &times; </button>


<button className="save-btn" onClick={handleCreateProject}> ✓ </button>
        </div>
        <input
          type="text"
          placeholder="새 프로젝트 이름"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="modal-input"
        />
      </Modal>


      <div className="schedule-container">
      {/* 캘린더 */}
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDayClick}
          onChange={setSelectedDate}
          value={selectedDate}
          formatMonthYear={(locale, date) => {
            return `${date.toLocaleString("en-US", {
              month: "long",
            })} ${selectedDate.getDate()} ${date.getFullYear()}`; // ✅ "March 21 2025" 형식
          }}
          formatDay={(locale, date) => date.getDate()} // '일' 제거하고 숫자만 표시
          formatShortWeekday={(locale, date) =>
            date.toLocaleDateString("en-US", { weekday: "short" }) // ✅ Mon, Tue, Wed 형태로 변경
          }
       
          tileContent={({ date }) => {
            const dateKey = date.toDateString();
            const dayEvents = events[dateKey] || [];
            console.log(dateKey, events[dateKey])
          
            return (
              <div className="calendar-event-container">
                {dayEvents.slice(0, 2).map((event, idx) => (
                  <div key={idx} className="calendar-event"
                    style={{ backgroundColor: event.color }}> {/* ✅ 프로젝트별 색상 적용 */}
                    {event.title}
                  </div>
                ))}
              </div>
            );
        }}
        />
      </div>
    </div>
          

  {/* Events and To-do List */}
<div className="schedule-content">
  {/* 일정 표시 */}
  <div className="schedule-section">
    <div className="schedule-horizontal">
      <div className="schedule-list">
        {(events[selectedDate.toDateString()] || []).map((event, index) => (
          <div key={index} className="schedule-item"
          onClick={() => handleEditEvent(event, index)} // ✅ 클릭 시 일정 수정 모달 열기
          >
            {/* 시간 + 파란 점 */}
            <div className="schedule-time">
              <span className="event-dot">●</span>
              <span className="event-time">{event.time}</span>
            </div>

            {/* 일정 제목 */}
            <div className="event-box">
              <div className="event-bar"></div>
              <div className="event-title">{event.title}</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  </div>
      

        {/* To-do List 표시 */}
        <div className="schedule-section">
          <h3>To-do List</h3>
          <div className="todo-list">
            {(projectData[selectedProject]?.todoLists[selectedDate.toDateString()] || []).map((todo, idx) => (
              <div key={idx} className="todo-item" onClick={(e) => {
                if (e.target.type !== "checkbox") { // ✅ 체크박스 클릭이 아닌 경우만 실행
                  handleEditTodo(todo, idx);
                }
              }}
            >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => {
                    e.stopPropagation(); // ✅ 모달이 열리지 않도록 이벤트 전파 방지
                    toggleTodo(todo);
                  }}
                />
                <span className={todo.completed ? "completed" : "todo-text"}>{todo.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={openModal}>
        <FaPlus />
      </button>

      {/* Add Schedule Modal */}
      <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      className="modal"
      overlayClassName="overlay"
      style={{
        content: {
          bottom: '0',
          top: 'auto',
          borderRadius: '20px 20px 0 0',
          padding: '20px',
          position: 'fixed',
          width: '100%',
          maxWidth: '500px',
          left: '50%',
          transform: 'translateX(-50%)'
        },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }
    }}
    >
      {/*새 프로젝트 추가 모달*/}
    <Modal
        isOpen={isProjectModalOpen}
        onRequestClose={closeProjectModal}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-header">
          <button className="close-btn" onClick={closeProjectModal}> &times; </button>
          <button className="save-btn" onClick={handleCreateProject}> ✓ </button>
        </div>
        <input
          type="text"
          placeholder="새 프로젝트 이름"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="modal-input"
        />
      </Modal>
      <button className="fab" onClick={() => setIsModalOpen(true)}>
        <FaPlus />
      </button> 

        <div className="modal-header">
          <img src={exitIcon} className="close-btn" onClick={closeModal}/> 
          {/* 삭제 아이콘 추가 */}
          <img 
            src={trashIcon} 
            alt="삭제" 
            className="delete-icon"
            onClick={() => {
              if (editingIndex !== null) {
                const dateKey = selectedDate.toDateString();
                if (eventType === "To-do") {
                  const todoToDelete = todoLists[dateKey]?.[editingIndex];
                  if (todoToDelete) {
                    setDeleteConfirm({
                      show: true,
                      item: todoToDelete,
                      isTodo: true,
                      isMain: selectedProject === defaultProject  // ✅ 메인 투두 여부
                    });                    
                  
                    closeModal();
                  }
                } else if (eventType === "Schedule") {
                  const eventToDelete = events[dateKey]?.[editingIndex];
                  if (eventToDelete) {
                    setDeleteConfirm({
                      show: true,
                      item: eventToDelete,
                      isTodo: false,
                      isMain: selectedProject === defaultProject  // ✅ 메인 일정 여부 추가
                    });
                    //setDeleteConfirm({ show: true, item: eventToDelete, isTodo: false });
                    closeModal();
                  }
                } 
              }
            }}
            />
          <img src={checkIcon} className="save-btn" onClick={handleSave}/> 
        </div>

  <input
    type="text"
    placeholder="일정 제목"
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    className="modal-input"
    style={{
      maxWidth: '100%',
      boxSizing: 'border-box',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '1.5rem',
      padding: '5px 0',
      outline: 'none'
    }}
  />

<div className="selection-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '5px', borderBottom: '2px solid white', paddingBottom: '10px' }}>
    <select
      className="dropdown"
      value={eventType}
      onChange={(e) => setEventType(e.target.value)}
      style={{ width: '20%' }}
    >
      <option value="Schedule">일정</option>
      <option value="To-do">To-do</option>
    </select>
  </div>


 {/*📌 날짜 표시 추가*/}
  <div className="date-display" onClick={handleOpenDateTimePicker}>
    {formatDateRange(selectedStartDate, selectedEndDate)}
  </div>
  {/* 📌 시간 설정 UI */}
  <div className="date-time" onClick={handleOpenDateTimePicker}>
        <label>{selectedTime || "시간 설정 (예: 3:00-4:00PM)"}</label>
      </div>

      {/* 📌 시간 선택 모달 */}
      {isDateTimePickerOpen && (
        <Modal
          isOpen={isDateTimePickerOpen}
          onRequestClose={() => setIsDateTimePickerOpen(false)}
          className="date-time-modal"
        >
          <h3 className="modal-title">날짜 및 시간 선택</h3>

          {/* 시작일 선택 */}
          <label className="modal-label">시작일</label>
          <DatePicker selected={selectedStartDate} onChange={(date) => setSelectedStartDate(date)} dateFormat="MM월 dd일" className="modal-datepicker" />

          {/* 종료일 선택 */}
          <label className="modal-label">종료일</label>
          <DatePicker selected={selectedEndDate} onChange={(date) => setSelectedEndDate(date)} dateFormat="MM월 dd일" className="modal-datepicker" />

          {/* 시작 시간 선택 */}
          <label className="modal-label">시작 시간</label>
          <DatePicker selected={selectedStartTime} onChange={(time) => setSelectedStartTime(time)} showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption="시간" dateFormat="h:mm aa" className="modal-timepicker" />

          {/* 종료 시간 선택 */}
          <label className="modal-label">종료 시간</label>
          <DatePicker selected={selectedEndTime} onChange={(time) => setSelectedEndTime(time)} showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption="시간" dateFormat="h:mm aa" className="modal-timepicker" />

          {/* 완료 버튼 */}
          <button onClick={handleDateTimeSelection} className="modal-confirm-btn">확인</button>
        </Modal>
      )}
   

  <div style={{ width: '100%', borderBottom: '2px solid white', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
  <div className="repeat-section" style={{ width: '25%' }}>
    <label style={{ marginBottom: '5px'}}>반복:</label>
    <select
      className="dropdown"
      value={repeatOption}
      onChange={(e) => setRepeatOption(e.target.value)}
      style={{ width: '100%' }} // 선택 박스를 부모 크기에 맞춤
    >
      <option value = "none">반복 없음</option>
      <option value="weekly">weekly</option>
      <option value="monthly">monthly</option>
      <option value="yearly">yearly</option>
    </select>
  </div>
  </div>

  <div className="alert-section" style={{ marginTop: '10px', width:'25%' }}>
    <label style={{ marginTop: '10px' }}>알림:</label>
    <select
      className="dropdown"
      value={alertOption}
      onChange={(e) => setAlertOption(e.target.value)}
    >
      <option value="이벤트 당일">이벤트 당일</option>
      <option value="1일 전">1일 전</option>
      <option value="1시간 전">1시간 전</option>
    </select>
  </div>
</Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <Modal
        isOpen={deleteConfirm.show}
        onRequestClose={() => setDeleteConfirm({ show: false, item: null, isTodo: false })}
        className="delete-modal"
        overlayClassName="overlay"
      >
        <div className="delete-modal-content">
          <p className="delete-text">
            <strong>‘{deleteConfirm.item.title}’ 일정을</strong> <br />
            삭제하시겠습니까?
          </p>
          <div className="delete-buttons">
            <button className="delete-btn" onClick={() => handleDelete(deleteConfirm.item, deleteConfirm.isTodo)}>예</button>
            <button className="cancel-btn" onClick={() => setDeleteConfirm({ show: false, item: null, isTodo: false })}>
              아니요
            </button>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
};

export default WholeSchedule;
