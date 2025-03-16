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
  const [nickname, setNickname] = useState();


  const [selectedColor, setSelectedColor] = useState("#FFCDD2"); // 기본 색상 설정
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");


  // ✅ localStorage에서 닉네임 불러오기
const storedUser = localStorage.getItem("user");
const extractedNickname = storedUser ? JSON.parse(storedUser).email.split("@")[0] : "unknown";
const defaultProject = `${extractedNickname}의 일정`;

const [projects, setProjects] = useState([defaultProject]); // ✅ 기본 프로젝트 이름 변경
const [selectedProject, setSelectedProject] = useState(defaultProject);


  // ✅ 프로젝트 목록 및 데이터 관리
  const [projectData, setProjectData] = useState({
    [defaultProject]: { events: {}, todoLists: {} },
  });

  
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
            eventList.map(event => ({ ...event, color: projectData[selectedProject]?.color || "#FFCDD2" })), // ✅ 현재 프로젝트 일정만 변경
          ])
        );
      });
    }
  }
}, [selectedProject, projectData]);




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

  // const userId = localStorage.getItem("userId"); // ✅ 사용자 ID 가져오기
  // // ✅ 초기 색상 불러오기 (GET 요청)
  // useEffect(() => {
  //   if (!userId) return;

  //   fetch(`/api/users/${userId}/color`)
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.color) {
  //         setSelectedColor(data.color); // 서버에서 저장된 색상 적용
  //       }
  //     })
  //     .catch(error => console.error("메인 테마 색상 불러오기 실패:", error));
  // }, [userId]);

  // ✅ 색상 선택 이벤트
//   const handleColorChange = async (e) => {
//     const newColor = e.target.value;
//     setSelectedColor(newColor);
  
//     // 🔥 현재 선택된 프로젝트 색상 변경
//     setProjectData((prev) => ({
//       ...prev,
//       [selectedProject]: {
//         ...prev[selectedProject],
//         color: newColor,
//         events: Object.fromEntries(
//           Object.entries(prev[selectedProject]?.events || {}).map(([date, eventList]) => [
//             date,
//             eventList.map(event => ({ ...event, color: newColor })), // 🔥 일정 색상 변경
//           ])
//         ),
//       },
//     }));

//     if (selectedProject !== defaultProject) {
//       setEvents((prev) => ({
//         ...prev,
//         ...Object.fromEntries(
//           Object.entries(prev).map(([date, eventList]) => [
//             date,
//             eventList.map(event =>
//               event.color === projectData[selectedProject]?.color ? { ...event, color: newColor } : event
//             ),
//           ])
//         ),
//       }));
//     };
    

//   if (!userId) return;

//   try {
//     // 색상이 처음 선택된 경우 (POST 요청)
//     const response = await fetch(`api/projects/{projectId}/theme`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ color: newColor }),
//     });

//     if (!response.ok) {
//       throw new Error("색상 저장 실패");
//     }
//   } catch (error) {
//     console.error("메인 테마 색상 저장 오류:", error);
//   }
// };

// ✅ 색상 선택 이벤트
// const handleColorChange = async (e) => {
//   const newColor = e.target.value;
//   setSelectedColor(newColor);

//   // 🔥 현재 선택된 프로젝트 색상 변경
//   setProjectData((prev) => ({
//     ...prev,
//     [selectedProject]: {
//       ...prev[selectedProject],
//       color: newColor,
//       events: Object.fromEntries(
//         Object.entries(prev[selectedProject]?.events || {}).map(([date, eventList]) => [
//           date,
//           eventList.map(event => ({ ...event, color: newColor })), // 🔥 일정 색상 변경
//         ])
//       ),
//     },
//   }));

//   if (selectedProject !== defaultProject) {
//     setEvents((prev) => ({
//       ...prev,
//       ...Object.fromEntries(
//         Object.entries(prev).map(([date, eventList]) => [
//           date,
//           eventList.map(event =>
//             event.color === projectData[selectedProject]?.color ? { ...event, color: newColor } : event
//           ),
//         ])
//       ),
//     }));
//   }

//   // ✅ API 요청 (메인 테마 or 프로젝트 테마 구분)
//   if (!userId) return;

//   try {
//     const accessToken = localStorage.getItem("access_token"); // 🔥 JWT 토큰 가져오기

//     if (selectedProject === defaultProject) {
//       // ✅ 메인 테마 색상 변경 (POST 요청)
//       const response = await fetch("/api/change-theme", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`, // 🔥 JWT 인증 추가
//         },
//         body: JSON.stringify({ temaColor: newColor }),
//       });

//       if (!response.ok) throw new Error("메인 테마 색상 저장 실패");

//       const data = await response.json();
//       console.log("✅ 메인 테마 색상 변경 성공:", data);

//       // ✅ 변경된 색상 반영
//       if (data.temaColor) {
//         setSelectedColor(data.temaColor);
//       }
//     } else {
//       // ✅ 프로젝트 테마 색상 변경 (PUT 요청)
//       const encodedProjectId = encodeURIComponent(selectedProject);

//       const response = await fetch(`/api/projects/${encodedProjectId}/mainTheme`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`, // 🔥 JWT 인증 추가
//         },
//         body: JSON.stringify({ temaColor: newColor }),
//       });

//       if (!response.ok) throw new Error("프로젝트 테마 색상 변경 실패");

//       const data = await response.json();
//       console.log("✅ 프로젝트 테마 색상 변경 성공:", data);

//       if (data.newColor) {
//         setSelectedColor(data.newColor);

//         setProjectData((prev) => ({
//           ...prev,
//           [selectedProject]: {
//             ...prev[selectedProject],
//             color: data.newColor,
//           },
//         }));
//       }
//     }
//   } catch (error) {
//     console.error("🚨 테마 색상 변경 오류:", error);
//   }
// };




// ✅ 색상 변경 이벤트 (PUT 요청)
// const updateColor = async (newColor) => {
//   setSelectedColor(newColor);

//   if (!userId) return;

//   try {
//     const response = await fetch(`change-theme`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ color: newColor }),
//     });

//     if (!response.ok) {
//       throw new Error("색상 변경 실패");
//     }
//   } catch (error) {
//     console.error("메인 테마 색상 변경 오류:", error);
//   }
// };

// 프로젝트 테마 색상 변경 (PUT 요청)
// const updateProjectTheme = async (projectId, newColor) => {
//   try {
//     const response = await fetch(`/api/projects/${projectId}/mainTheme`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ color: newColor }),
//     });

//     if (!response.ok) throw new Error("프로젝트 테마 색상 변경 실패");

//     // ✅ 변경된 색상을 상태에 반영
//     setProjectData((prev) => ({
//       ...prev,
//       [projectId]: {
//         ...prev[projectId],
//         color: newColor,
//       },
//     }));
//   } catch (error) {
//     console.error("프로젝트 테마 색상 변경 오류:", error);
//   }
// };

// ✅ 프로젝트 변경 시 테마 색상 조회
// useEffect(() => {
//   if (selectedProject) {
//     fetchProjectTheme(selectedProject);
//   }
// }, [selectedProject]);


useEffect(() => {
  // ✅ localStorage에서 사용자 정보 가져오기
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const extractedNickname = parsedUser.email ? parsedUser.email.split("@")[0] : "unknown"; // 이메일에서 닉네임 추출
      setNickname(`${extractedNickname}의 일정`);
    } catch (error) {
      console.error("🚨 JSON 파싱 오류:", error);
    }
  }
}, []);


// ✅ 메인 테마 색상 조회 (GET 요청)
const fetchMainThemeColor = async () => {
  try {
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch("/api/projects/mainTheme", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // ✅ JWT 토큰 포함
      },
    });

    if (!response.ok) throw new Error(`메인 테마 색상 조회 실패: ${response.status}`);

    const data = await response.json();
    console.log("✅ 메인 테마 색상 API 응답:", data);

    if (data.temaColor) {
      setSelectedColor(data.temaColor);
    }
  } catch (error) {
    console.error("🚨 메인 테마 색상 조회 오류:", error);
  }
};

// ✅ 프로젝트 테마 색상 조회 (GET 요청)
const fetchProjectTheme = async (projectId) => {
  try {
    const encodedProjectId = encodeURIComponent(projectId);
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(`/api/projects/${encodedProjectId}/mainTheme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error(`프로젝트 테마 색상 조회 실패: ${response.status}`);

    const data = await response.json();
    console.log("✅ 프로젝트 테마 색상 API 응답:", data);

    if (data.temaColor) {
      setSelectedColor(data.temaColor);

      // ✅ 프로젝트 데이터에도 색상 반영
      setProjectData((prev) => ({
        ...prev,
          [projectId]: { ...prev[projectId], color: data.temaColor },
      }));
    }
  } catch (error) {
    console.error("🚨 프로젝트 테마 색상 조회 오류:", error);
  }
};

// ✅ 메인 테마 색상 변경 (POST 요청)
const updateMainThemeColor = async (newColor) => {
  try {
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch("/api/change-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ temaColor: newColor }),
    });

    if (!response.ok) throw new Error(`메인 테마 색상 변경 실패: ${response.status}`);
    setSelectedColor(newColor);
  } catch (error) {
    console.error("🚨 메인 테마 색상 변경 오류:", error);
  }
};

// ✅ 프로젝트 테마 색상 변경 (PUT 요청)
const updateProjectThemeColor = async (projectId, newColor) => {
  try {
    const encodedProjectId = encodeURIComponent(projectId);
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(`/api/projects/${encodedProjectId}/mainTheme`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ temaColor: newColor }),
    });

    if (!response.ok) throw new Error(`프로젝트 테마 색상 변경 실패: ${response.status}`);

    const data = await response.json();
    console.log("✅ 프로젝트 테마 색상 변경 응답:", data);

    if (data.newColor) {
      setSelectedColor(data.newColor);

      setProjectData((prev) => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          color: data.newColor,
        },
      }));
    }
  } catch (error) {
    console.error("🚨 프로젝트 테마 색상 변경 오류:", error);
  }
};

const handleColorChange = (e) => {
  const newColor = e.target.value;
  setSelectedColor(newColor);
  setProjectData((prev) => ({
    ...prev,
    [selectedProject]: {
      ...prev[selectedProject],
      color: newColor,
      events: Object.fromEntries(
        Object.entries(prev[selectedProject]?.events || {}).map(([date, eventList]) => [
          date,
          eventList.map((event) => ({ ...event, color: newColor })),
        ])
      ),
    },
  }));

  if (selectedProject === defaultProject) {
    updateMainThemeColor(newColor);
  } else {
    updateProjectThemeColor(selectedProject, newColor);
  }
};

useEffect(() => {
  if (selectedProject === defaultProject) {
    fetchMainThemeColor();
  } else {
    fetchProjectTheme(selectedProject);
  }
}, [selectedProject]);









  

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

  // 📌 일정 조회 (선택한 날짜의 일정 불러오기)
const fetchEventsForDate = async (date) => {
  const dateKey = date.toDateString();

  try {
    const response = await fetch(`/api/users/schedules/${dateKey}`);
    if (!response.ok) throw new Error("일정 불러오기 실패");

    const data = await response.json();
    setEvents((prev) => ({
      ...prev,
      [dateKey]: data.schedules || [], // 서버에서 받아온 일정 목록
    }));
  } catch (error) {
    console.error("일정 불러오기 오류:", error);
  }
};

// 📌 날짜 클릭 시 해당 날짜 일정 조회
const handleDayClick = (date) => {
  setSelectedDate(date);
  fetchEventsForDate(date);
};


// 📌 일정 수정 (PUT 요청)
const updateEvent = async (scheduleId, updatedEvent) => {
  try {
    const response = await fetch(`/api/users/schedules/${scheduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) throw new Error("일정 수정 실패");

    setEvents((prev) => {
      const dateKey = selectedDate.toDateString();
      return {
        ...prev,
        [dateKey]: prev[dateKey].map((event) =>
          event.id === scheduleId ? { ...event, ...updatedEvent } : event
        ),
      };
    });

    closeModal();
  } catch (error) {
    console.error("일정 수정 오류:", error);
  }
};

// 📌 일정 삭제 (DELETE 요청)
const handleDeleteEvent = async () => {
  if (!deleteConfirm.item) return; // 삭제할 항목이 없으면 실행하지 않음

  const scheduleId = deleteConfirm.item.id; // 일정 ID 가져오기
  const dateKey = selectedDate.toDateString();

  try {
    const response = await fetch(`/api/users/schedules/${scheduleId}`, {
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
    const response = await fetch(`/api/users/todo/${todoId}`);

    if (!response.ok) throw new Error("투두 조회 실패");

    const data = await response.json();
    return data; // 서버에서 받은 투두 데이터 반환
  } catch (error) {
    console.error("투두 조회 오류:", error);
    return null;
  }
};
// 📌 To-do 추가 (POST 요청)
const addTodo = async () => {
  const dateKey = selectedDate.toDateString();
  const newTodo = {
    title: newTitle,
    date: dateKey,
    completed: false,
  };

  try {
    const response = await fetch("/api/users/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    if (!response.ok) throw new Error("투두 추가 실패");

    const savedTodo = await response.json(); // 서버에서 저장된 투두 반환

    // ✅ 현재 프로젝트 데이터 업데이트
    setProjectData((prev) => ({
      ...prev,
      [selectedProject]: {
        ...prev[selectedProject],
        todoLists: {
          ...prev[selectedProject]?.todoLists,
          [dateKey]: [...(prev[selectedProject]?.todoLists[dateKey] || []), savedTodo],
        },
      },
    }));

    setTodoLists((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), savedTodo],
    }));

    closeModal();
  } catch (error) {
    console.error("투두 추가 오류:", error);
  }
};
// 📌 To-do 수정 (PUT 요청)
const updateTodo = async (todoId, updatedTodo) => {
  try {
    const response = await fetch(`/api/users/todo/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });

    if (!response.ok) throw new Error("투두 수정 실패");

    setTodoLists((prev) => {
      const dateKey = selectedDate.toDateString();
      return {
        ...prev,
        [dateKey]: prev[dateKey].map((todo) =>
          todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        ),
      };
    });

    closeModal();
  } catch (error) {
    console.error("투두 수정 오류:", error);
  }
};
// 📌 To-do 삭제 (PUT 요청)
const deleteTodo = async (todoId) => {
  const dateKey = selectedDate.toDateString();
  try {
    const response = await fetch(`/api/users/todo/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: true }),
    });

    if (!response.ok) throw new Error("투두 삭제 실패");

    setProjectData((prev) => {
      const updatedProjectData = { ...prev };
      if (updatedProjectData[selectedProject]?.todoLists) {
        updatedProjectData[selectedProject].todoLists[dateKey] =
          updatedProjectData[selectedProject].todoLists[dateKey].filter((todo) => todo.id !== todoId);

        // ✅ 삭제 후 데이터가 비어 있으면 해당 날짜 키 삭제
        if (updatedProjectData[selectedProject].todoLists[dateKey].length === 0) {
          delete updatedProjectData[selectedProject].todoLists[dateKey];
        }
      }
      return updatedProjectData;
    });

    setTodoLists((prev) => {
      const updatedTodos = { ...prev };
      if (updatedTodos[dateKey]) {
        updatedTodos[dateKey] = updatedTodos[dateKey].filter((todo) => todo.id !== todoId);
      }
      // ✅ 삭제 후 해당 날짜의 할 일이 없다면 날짜 키 삭제
      if (updatedTodos[dateKey].length === 0) {
        delete updatedTodos[dateKey];
      }
      return updatedTodos;
    });

    setDeleteConfirm({ show: false, item: null, isTodo: false });
  } catch (error) {
    console.error("투두 삭제 오류:", error);
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
    setNewTitle(event.title);
    setEventType(event.type);
    setSelectedColor(event.color);
    setSelectedTime(event.time);
    setRepeatOption(event.repeat);
    setAlertOption(event.alert);
    setEditingIndex(index); // 수정 모드 진입
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

const handleSave = () => {
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
      // ✅ 일정(Schedule) 추가 로직
      if (editingIndex !== null) {
        if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
        updatedEvents[dateKey][editingIndex] = newItem;
        setEditingIndex(null);
      } else {
        if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
        updatedEvents[dateKey].push(newItem);

        // 🔹 반복 일정 추가
        if (repeatOption === "weekly") {
          for (let i = 1; i <= 10; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + i * 7);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push({ ...newItem });
          }
        }

        if (repeatOption === "monthly") {
          for (let i = 1; i <= 12; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setMonth(nextDate.getMonth() + i);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push({ ...newItem });
          }
        }

        if (repeatOption === "yearly") {
          for (let i = 1; i <= 5; i++) {
            let nextDate = new Date(currentDate);
            nextDate.setFullYear(currentDate.getFullYear() + i);
            const nextDateKey = nextDate.toDateString();
            if (!updatedEvents[nextDateKey]) updatedEvents[nextDateKey] = [];
            updatedEvents[nextDateKey].push({ ...newItem });
          }
        }
      }
      setEvents(updatedEvents);
    }else if (eventType === "To-do") {
    // ✅ To-do 추가 및 수정
    if (!updatedTodos[dateKey]) {
      updatedTodos[dateKey] = [];
    }

    if (editingIndex !== null) {
      // ✅ 수정 모드: 기존 항목을 수정 (새로 추가하지 않음)
      updatedTodos[dateKey] = updatedTodos[dateKey].map((todo, idx) =>
        idx === editingIndex ? newItem : todo
      );
      setEditingIndex(null);
    } else {
      // ✅ 새 To-do 추가
      updatedTodos[dateKey].push(newItem);
    }

    setTodoLists(updatedTodos);
     // ✅ 프로젝트 데이터에도 동기화
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

    // 다음 날짜로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }
  // ✅ 프로젝트 데이터에 직접 저장
  setProjectData((prev) => ({
    ...prev,
    [selectedProject]: {
      ...prev[selectedProject],
      events: updatedEvents,
      
    },
  }));
  

  closeModal();
};


// ✅ 일정 추가 (서버 요청 포함)
const addEvent = async () => {
  let currentDate = new Date(selectedStartDate);
  const endDate = new Date(selectedEndDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toDateString();
    const newEvent = {
      title: newTitle,
      type: eventType,
      color: selectedColor,
      time: selectedTime,
      repeat: repeatOption,
      alert: alertOption,
      completed: false,
      date: dateKey, // ✅ 서버에서 날짜를 구분하도록 추가
    };

    try {
      const response = await fetch("/api/users/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) throw new Error("일정 추가 실패");

      const savedEvent = await response.json();
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), savedEvent],
      }));
    } catch (error) {
      console.error("일정 추가 오류:", error);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  closeModal();
};



  const handleDelete = (item, isTodo) => {
    const dateKey = selectedDate.toDateString();

    if (isTodo) {
      setTodoLists((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey]?.filter((todo) => todo !== item),
      }));
    } else {
      setEvents((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey]?.filter((event) => event !== item),
      }));
    }

    setDeleteConfirm({ show: false, item: null, isTodo: false });
  };

  const toggleTodo = (item) => {
    const dateKey = selectedDate.toDateString();

    setTodoLists((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.map((todo) =>
        todo === item ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
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
            onBlur={(e) => updateMainThemeColor(e.target.value)}
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
            {(todoLists[selectedDate.toDateString()] || []).map((todo, idx) => (
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
