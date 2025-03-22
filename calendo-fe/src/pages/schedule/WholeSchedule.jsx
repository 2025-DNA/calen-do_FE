import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
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

  // ✅ localStorage에서 닉네임 불러오기
  const storedUser = localStorage.getItem("user");
  const extractedNickname = storedUser ? JSON.parse(storedUser).email.split("@")[0] : "unknown";
  const defaultProject = `${extractedNickname}의 일정`;

  // ✅ 프로젝트 목록 및 데이터 관리
  const [projects, setProjects] = useState([defaultProject]);
  const [selectedProject, setSelectedProject] = useState(defaultProject);
  const [projectData, setProjectData] = useState({
    [defaultProject]: { events: {}, todoLists: {} },
  });

  // const fetchSchedules = async () => {
  //   try {
  //     let token = localStorage.getItem("access-token");
  
  //     // 🔥 `access_token`이 null이면 `accessToken` 또는 `jwt_token`을 사용
  //     if (!token) {
  //       token = localStorage.getItem("accessToken") || localStorage.getItem("jwt_token");
  //     }
  
  //     if (!token) {
  //       console.error("❌ Access Token이 없습니다!");
  //       return;
  //     }
  
  //     console.log(`📌 보낼 토큰: Bearer ${token}`); // ✅ 실제 토큰 값 확인
  
  //     const response = await fetch("https://calendo.site/api/schedules", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`, // ✅ Bearer Token 추가
  //       },
  //       credentials: "include", // ✅ CORS 문제 해결 (쿠키 포함)
  //     });

  //     if (response.status === 401 || response.redirected) {
  //       // 인증이 안 되어있거나 로그인 필요하면 OAuth로 이동
  //       window.location.href = "https://calendo.site/oauth2/authorization/google";
  //       return;
  //     }
  //     if (!response.ok) throw new Error("일정 불러오기 실패");
  
  //     const data = await response.json();
  //     console.log("✅ 일정 데이터:", data);
  //     return data;

  //   } catch (error) {
  //     console.error("🚨 API 호출 실패:", error);
  //   }
  // };
  
  // fetchSchedules();
  
  

  
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
      [newProjectName]: { events: {}, todoLists: {}, color: "#FFCDD2" }, // 🔥 프로젝트 색상 추가
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


useEffect(() => {
  if (selectedProject === defaultProject) {
    // ✅ 메인 프로젝트에서는 모든 프로젝트 일정 합치기
    let mergedEvents = {};
    let mergedTodos = {};

    Object.keys(projectData).forEach((project) => {
      const projectEvents = projectData[project]?.events || {};
      const projectTodos = projectData[project]?.todoLists || {};

      Object.keys(projectEvents).forEach((dateKey) => {
        if (!mergedEvents[dateKey]) mergedEvents[dateKey] = [];
        mergedEvents[dateKey] = [
          ...mergedEvents[dateKey],
          ...projectEvents[dateKey].map((event) => ({
            ...event,
            color: projectData[project]?.color || "#FFCDD2", // 🔥 해당 프로젝트 색상 적용
          })),
        ];
      });

      Object.keys(projectTodos).forEach((dateKey) => {
        if (!mergedTodos[dateKey]) mergedTodos[dateKey] = [];
        mergedTodos[dateKey] = [...mergedTodos[dateKey], ...projectTodos[dateKey]];
      });
    });

    setEvents(mergedEvents);
    setTodoLists(mergedTodos);
  } else {
    if (selectedProject !== defaultProject) {
      setEvents(() => {
        const updatedEvents = projectData[selectedProject]?.events || {};
        return Object.fromEntries(
          Object.entries(updatedEvents).map(([date, eventList]) => [
            date,
            eventList.map(event => ({ ...event, color: projectData[selectedProject]?.color || "#FFCDD2", 
            })), // ✅ 현재 프로젝트 일정만 변경
          ])
        );
      });
    }
  }
}, [selectedProject, projectData]);



const addTodo = async (dateKey) => {
  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return null;
  }

  const body = { title: newTitle };

  try {
    const response = await fetch(`https://calendo.site/api/todos/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("투두 추가 실패");

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const savedTodo = await response.json();
      console.log("✅ 투두 추가 성공 (JSON):", savedTodo);
      return savedTodo;
    } else {
      const text = await response.text();
      console.log("✅ 투두 추가 성공 (문자열):", text);
      // 백엔드가 실제 투두 객체를 안 보내면 여기선 null 반환
      return {
        id: Date.now(), // 임시 ID
        title: newTitle,
        completed: false
      };
    }
  } catch (error) {
    console.error("투두 추가 오류:", error);
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
  // ✅ 초기 색상 불러오기 (GET 요청)
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}/color`)
      .then(response => response.json())
      .then(data => {
        if (data.color) {
          setSelectedColor(data.color); // 서버에서 저장된 색상 적용
        }
      })
      .catch(error => console.error("메인 테마 색상 불러오기 실패:", error));
  }, [userId]);

  // ✅ 색상 선택 이벤트
  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
  
    // 🔥 현재 선택된 프로젝트 색상 변경
    setProjectData((prev) => ({
      ...prev,
      [selectedProject]: {
        ...prev[selectedProject],
        color: newColor,
        events: Object.fromEntries(
          Object.entries(prev[selectedProject]?.events || {}).map(([date, eventList]) => [
            date,
            eventList.map(event => ({ ...event, color: newColor })), // 🔥 일정 색상 변경
          ])
        ),
      },
    }));

    if (selectedProject !== defaultProject) {
      setEvents((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(prev).map(([date, eventList]) => [
            date,
            eventList.map(event =>
              event.color === projectData[selectedProject]?.color ? { ...event, color: newColor } : event
            ),
          ])
        ),
      }));
    };
    

  if (!userId) return;

  try {
    // 색상이 처음 선택된 경우 (POST 요청)
    const response = await fetch(`api/projects/{projectId}/theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: newColor }),
    });

    if (!response.ok) {
      throw new Error("색상 저장 실패");
    }
  } catch (error) {
    console.error("메인 테마 색상 저장 오류:", error);
  }
};

// ✅ 색상 변경 이벤트 (POST 요청)
const updateColor = async (newColor) => {
  setSelectedColor(newColor);

  if (!userId) return;

  try {
    const response = await fetch(`change-theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: newColor }),
    });

    if (!response.ok) {
      throw new Error("색상 변경 실패");
    }
  } catch (error) {
    console.error("메인 테마 색상 변경 오류:", error);
  }
};

// 프로젝트 테마 색상 조회 (GET 요청)
const fetchProjectTheme = async (projectId) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/mainTheme`);
    if (!response.ok) throw new Error("프로젝트 테마 색상 조회 실패");

    const data = await response.json();
    if (data.color) {
      setSelectedColor(data.color); // 🔥 프로젝트 색상 반영



      setEvents((prev) => {
        return Object.fromEntries(
          Object.entries(prev).map(([date, eventList]) => [
            date,
            eventList.map(event => ({ ...event, color: data.color })), // ✅ 색상 업데이트
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

// 프로젝트 테마 색상 변경 (PUT 요청)
const updateProjectTheme = async (projectId, newColor) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/mainTheme`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: newColor }),
    });

    if (!response.ok) throw new Error("프로젝트 테마 색상 변경 실패");

    // ✅ 변경된 색상을 상태에 반영
    setProjectData((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        color: newColor,
      },
    }));
  } catch (error) {
    console.error("프로젝트 테마 색상 변경 오류:", error);
  }
};

// ✅ 프로젝트 변경 시 테마 색상 조회
useEffect(() => {
  if (selectedProject) {
    fetchProjectTheme(selectedProject);
  }
}, [selectedProject]);



  useEffect(() => {
    // ✅ `localStorage`에서 닉네임 가져오기
    const storedNickname = localStorage.getItem("nickname") || "unknown";
    setNickname(`${storedNickname}의 일정`);
  }, []);
  

  const [projectMembers, setProjectMembers] = useState({
    "내 일정": ["나", "수현"], // 기본 프로젝트의 팀원
  });
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const toggleMemberDropdown = () => {
    setIsMemberDropdownOpen(!isMemberDropdownOpen);
  };

  const handleAddMember = () => {
    const newMember = prompt("추가할 팀원 이름을 입력하세요:");
    if (newMember && newMember.trim() !== "") {
      setProjectMembers((prev) => ({
        ...prev,
        [selectedProject]: [...(prev[selectedProject] || []), newMember],
      }));
    }
  };
  const formatDateToYYYYMMDD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchEventsForDate = async (date) => {
    const formattedDate = formatDateToYYYYMMDD(date);
    const token = localStorage.getItem("access-token") ||
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("jwt_token");
  
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
      console.log("✅ 조회한 일정 데이터:", data.schedules);
  
      setEvents((prev) => ({
        ...prev,
        [formattedDate]: data.schedules || [],
      }));
    } catch (error) {
      console.error("일정 불러오기 오류:", error);
    }
  };
  




  
  // 📌 일정 조회 (선택한 날짜의 일정 불러오기)
  // const fetchEventsForDate = async (date) => {
  //   //const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
  //   const formattedDate = formatDateToYYYYMMDD(date);

    
  //   try {
  //     let token = localStorage.getItem("access-token") ||
  //                 localStorage.getItem("accessToken") ||
  //                 localStorage.getItem("jwt_token");
  
  //     if (!token) {
  //         console.error("❌ Access Token이 없습니다! 로그인 필요");
  //         return;
  //     }
              
  //     console.log(`📌 보낼 토큰: Bearer ${token}`);
  
  //     const response = await fetch(`https://calendo.site/api/schedules?date=${dateKey}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`, // ✅ 토큰 포함
  //       },
  //       credentials: "include", // ✅ 쿠키 기반 인증 사용하는 경우 필요
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`일정 조회 실패: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  //     console.log("✅ 조회한 일정 데이터:", data);
  //     console.log("📅 클릭한 날짜:", dateKey); // 2025-03-25
  

  //     console.log("📌 보낼 날짜:", dateKey);
  //     console.log("📌 보낼 토큰:", token);
  //     console.log("📌 요청 주소:", `https://calendo.site/api/schedules?date=${dateKey}`);

  //     // ✅ 서버 응답 형식 맞게 가공
  //     const transformed = (data || []).map((item) => ({
  //       id: item.id,
  //       title: item.title,
  //       time: `${item.startDateTime.split("T")[1]} - ${item.endDateTime.split("T")[1]}`,
  //       repeat: item.repeatType?.toLowerCase() || "none",
  //       color: "#FFCDD2", // 혹시 color 없음 처리
  //       type: "Schedule",
  //       completed: false,
  //       alert: "이벤트 당일(오전 9시)", // 기본 알림값
  //     }));
  
  //     setEvents((prev) => ({
  //       ...prev,
  //       [date.toDateString()]: transformed,
  //     }));
  //   } catch (error) {
  //     console.error("🚨 일정 조회 오류:", error);
  //   }
  // };
  
  
  // 🔧 시간 포맷 변환 함수 (예: "22:32" → "10:32 PM")
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  

// 📌 날짜 클릭 시 해당 날짜 일정 조회
const handleDayClick = (date) => {
  setSelectedDate(date);
  fetchEventsForDate(date);
};


// 📌 일정 수정 (PUT 요청)
// const updateEvent = async (scheduleId, updatedEvent) => {
//   try {
//     const response = await fetch(`/api/schedules/${scheduleId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedEvent),
//     });

//     if (!response.ok) throw new Error("일정 수정 실패");

//     setEvents((prev) => {
//       const dateKey = selectedDate.toDateString();
//       return {
//         ...prev,
//         [dateKey]: prev[dateKey].map((event) =>
//           event.id === scheduleId ? { ...event, ...updatedEvent } : event
//         ),
//       };
//     });

//     closeModal();
//   } catch (error) {
//     console.error("일정 수정 오류:", error);
//   }
// };

//일정 수정
const updateEvent = async (scheduleId, updatedEvent) => {
  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");

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

    const result = await response.json();
    console.log("✅ 일정 수정 성공:", result);

    // 필요한 후처리: 모달 닫기, 일정 새로고침 등
  } catch (error) {
    console.error("❌ 일정 수정 오류:", error);
  }
};


// 📌 일정 삭제 (DELETE 요청)
const handleDeleteEvent = async () => {
  if (!deleteConfirm.item) return; // 삭제할 항목이 없으면 실행하지 않음

  const scheduleId = deleteConfirm.item.id; // 일정 ID 가져오기
  const dateKey = selectedDate.toDateString();

  try {
    const response = await fetch(`/api/schedules/${scheduleId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("일정 삭제 실패");

    // 삭제 성공 후 상태 업데이트
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.filter((event) => event.id !== scheduleId),
    }));

    setDeleteConfirm({ show: false, item: null, isTodo: false });
    closeModal();
  } catch (error) {
    console.error("일정 삭제 오류:", error);
  }
};

// 📌 투두리스트 조회 (선택한 투두 정보 가져오기)
const fetchTodo = async (todoId) => {
  try {
    const response = await fetch(`/api/todo/${todoId}`);

    if (!response.ok) throw new Error("투두 조회 실패");

    const data = await response.json();
    return data; // 서버에서 받은 투두 데이터 반환
  } catch (error) {
    console.error("투두 조회 오류:", error);
    return null;
  }
};
// 📌 To-do 추가 (POST 요청)
// const addTodo = async () => {
//   const dateKey = selectedDate.toDateString();
//   const newTodo = {
//     title: newTitle,
//     date: dateKey,
//     completed: false,
//   };

//   try {
//     const response = await fetch("/api/users/todo", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newTodo),
//     });

//     if (!response.ok) throw new Error("투두 추가 실패");

//     const savedTodo = await response.json(); // 서버에서 저장된 투두 반환

//     // ✅ 현재 프로젝트 데이터 업데이트
//     setProjectData((prev) => ({
//       ...prev,
//       [selectedProject]: {
//         ...prev[selectedProject],
//         todoLists: {
//           ...prev[selectedProject]?.todoLists,
//           [dateKey]: [...(prev[selectedProject]?.todoLists[dateKey] || []), savedTodo],
//         },
//       },
//     }));

//     setTodoLists((prev) => ({
//       ...prev,
//       [dateKey]: [...(prev[dateKey] || []), savedTodo],
//     }));

//     closeModal();
//   } catch (error) {
//     console.error("투두 추가 오류:", error);
//   }
// };
// 📌 To-do 수정 (PUT 요청)
// const updateTodo = async (todoId, updatedTodo) => {
//   try {
//     const response = await fetch(`/api/todo/${todoId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedTodo),
//     });

//     if (!response.ok) throw new Error("투두 수정 실패");

//     setTodoLists((prev) => {
//       const dateKey = selectedDate.toDateString();
//       return {
//         ...prev,
//         [dateKey]: prev[dateKey].map((todo) =>
//           todo.id === todoId ? { ...todo, ...updatedTodo } : todo
//         ),
//       };
//     });

//     closeModal();
//   } catch (error) {
//     console.error("투두 수정 오류:", error);
//   }
// };

//투두 수정
const updateTodo = async (todoId, newTitle) => {
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
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) throw new Error("투두 수정 실패");

    const result = await response.json();
    console.log("✅ 투두 수정 성공:", result);

    // 프론트 상태 업데이트
    const dateKey = selectedDate.toDateString();
    setTodoLists((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((todo) =>
        todo.id === todoId ? { ...todo, title: newTitle } : todo
      ),
    }));

    closeModal();
  } catch (error) {
    console.error("❌ 투두 수정 오류:", error);
  }
};






// 📌 To-do 삭제 (PUT 요청)
// const deleteTodo = async (todoId) => {
//   const dateKey = selectedDate.toDateString();
//   try {
//     const response = await fetch(`/api/users/todo/${todoId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ deleted: true }),
//     });

//     if (!response.ok) throw new Error("투두 삭제 실패");

//     setProjectData((prev) => {
//       const updatedProjectData = { ...prev };
//       if (updatedProjectData[selectedProject]?.todoLists) {
//         updatedProjectData[selectedProject].todoLists[dateKey] =
//           updatedProjectData[selectedProject].todoLists[dateKey].filter((todo) => todo.id !== todoId);

//         // ✅ 삭제 후 데이터가 비어 있으면 해당 날짜 키 삭제
//         if (updatedProjectData[selectedProject].todoLists[dateKey].length === 0) {
//           delete updatedProjectData[selectedProject].todoLists[dateKey];
//         }
//       }
//       return updatedProjectData;
//     });

//     setTodoLists((prev) => {
//       const updatedTodos = { ...prev };
//       if (updatedTodos[dateKey]) {
//         updatedTodos[dateKey] = updatedTodos[dateKey].filter((todo) => todo.id !== todoId);
//       }
//       // ✅ 삭제 후 해당 날짜의 할 일이 없다면 날짜 키 삭제
//       if (updatedTodos[dateKey].length === 0) {
//         delete updatedTodos[dateKey];
//       }
//       return updatedTodos;
//     });

//     setDeleteConfirm({ show: false, item: null, isTodo: false });
//   } catch (error) {
//     console.error("투두 삭제 오류:", error);
//   }
// };



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

const handleSave = async () => {
  let currentDate = new Date(selectedStartDate);
  const endDate = new Date(selectedEndDate);
  let updatedEvents = { ...projectData[selectedProject]?.events };
  let updatedTodos = { ...todoLists };

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
        updatedEvents[dateKey][editingIndex] = newItem;
        setEditingIndex(null);
      } else {
        const added = await addEvent(); // ✅ addEvent가 서버로부터 받은 일정 객체 반환

        if (added) {
          const updatedItem = {
            ...added,
            type: "Schedule",
            color: projectData[selectedProject]?.color || "#FFCDD2",
            time: selectedTime,
            repeat: repeatOption,
            alert: alertOption,
            completed: false
          };

          if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
          updatedEvents[dateKey].push(updatedItem);
        }

        // 🔁 반복 처리 (화면용)
        const createRepeatItem = (dateObj) => ({
          ...newItem,
          color: projectData[selectedProject]?.color || "#FFCDD2",
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
        const editingTodo = updatedTodos[dateKey][editingIndex];
        if (editingTodo?.id) {
          await updateTodo(editingTodo.id, newTitle);
        } else {
          console.error("❌ 수정할 투두에 ID가 없습니다:", editingTodo);
        }
        setEditingIndex(null);
      
        updatedTodos[dateKey][editingIndex] = newItem;
       
        // updatedTodos[dateKey] = updatedTodos[dateKey].map((todo, idx) =>
        //   idx === editingIndex ? newItem : todo
        // );
        // setEditingIndex(null);
      } else {
        // 서버에 투두 추가 요청
        const addedTodo = await addTodo(currentDate, newTitle);

        //updatedTodos[dateKey].push(newItem);
      

        if (addedTodo) {
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

  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");


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
    return result.schedule; // ✅ schedule 객체 반환

  } catch (error) {
    console.error("❌ 일정 추가 오류:", error);
    return null;
  }
};

  
const handleDelete = async (item, isTodo) => {
  if (!item?.id) {
    console.error("❌ 삭제할 항목의 ID가 없습니다. 데이터 확인 필요:", item);
    return;
  }

  const token = localStorage.getItem("access-token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("jwt_token");

  if (!token) {
    console.error("❌ Access Token이 없습니다!");
    return;
  }

  const dateKey = selectedDate.toDateString();

  // 🔁 To-do 삭제 경로는 그대로 두고 일정 삭제 경로만 수정
  const url = isTodo
    ? `https://calendo.site/api/todo/${item.id}`
    : `https://calendo.site/delete-schedule/${item.id}`;

  console.log("🚀 삭제 요청 URL:", url);

  try {
    const response = await fetch(url, {
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

    console.log("✅ 삭제 성공:", item.id);

    if (isTodo) {
      setTodoLists((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].filter((todo) => todo.id !== item.id),
      }));
    } else {
      setEvents((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].filter((event) => event.id !== item.id),
      }));
    }
  } catch (error) {
    console.error("삭제 오류:", error);
  }

  setDeleteConfirm({ show: false, item: null, isTodo: false });
};

  


  const toggleTodo = (todo) => {
    const dateKey = selectedDate.toDateString();
  
    setProjectData((prev) => {
      const updatedTodos = (prev[selectedProject]?.todoLists[dateKey] || []).map((t) =>
        t === todo ? { ...t, completed: !t.completed } : t
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
      {(projectMembers[selectedProject] || []).map((member, index) => (
        <div key={index} className="member-item">{member}</div>
      ))}
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
            onBlur={(e) => updateColor(e.target.value)}
            className="color-picker"
          />
        </div>
        
        <div className="app-bar-right">
          <img src={alertIcon} className="icon" onClick={() => navigate("/alert")}/>
          <img src={addProjectIcon} className="icon" onClick={() => setIsProjectModalOpen(true)} />
          <img src={timeIcon} className="icon" onClick={() => navigate("/plan")}/>
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
                    setDeleteConfirm({ show: true, item: todoToDelete, isTodo: true });
                    closeModal();
                  }
                } else if (eventType === "Schedule") {
                  const eventToDelete = events[dateKey]?.[editingIndex];
                  if (eventToDelete) {
                    setDeleteConfirm({ show: true, item: eventToDelete, isTodo: false });
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
