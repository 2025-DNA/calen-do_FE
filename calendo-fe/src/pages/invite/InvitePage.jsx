import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../services/api";
import styled from "styled-components";
import * as S from "./styled";
import ListSearch from "../../components/common/inputs/ListSearch";
import backIcon from "../../assets/icons/backbtn.svg";

const StyledInput = styled.input`
    display: flex;
    align-items: center;
    border-radius: 7px;
    border: 0px;
    padding: 13px;
    width: 95%;
    background-color: rgb(255, 255, 255);
    outline: none;
    color: rgb(54, 54, 54);
    ${(props) =>
        props.height &&
        `height: ${props.height}px;`}
    font-size: 20px;
    font-weight: bold;
    resize: none;
    box-shadow: 0 4px 14px rgba(229, 229, 229, 100);
    margin-bottom: 30px;
`;

const InvitedList = styled.ul`
    display: flex;
    flex-direction: column;
    width: 95%;
    list-style: none;
    padding: 0px;
    margin-top: 20px;
    gap: 7px;
`;

const InvitedItem = styled.li`
    display: flex;
    background-color: #FFE3E3;
    padding: 10px 20px;
    font-size: 18px;
`;

function InvitePage() {
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState(""); 
    const [searchResults, setSearchResults] = useState([]); 
    const [invitedUsers, setInvitedUsers] = useState([]); 
    const [projectName, setProjectName] = useState(""); 
    const [currentUser, setCurrentUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("accessToken");
        if (storedUser) {
            setCurrentUser(storedUser);
        }
        if (token) {
            setAccessToken(token);
        }
        console.log("📌 저장된 토큰 확인:", localStorage.getItem("access-token")); // or accessToken

    }, []);

    useEffect(() => {
        console.log("Updated token:", accessToken);
    }, [accessToken]);

    /*유저 검색*/
    const onSearch = async (input) => {
        setUserInput(input);
    
        if (input.trim() === "") {
            setSearchResults([]);
            return;
        }
    
        const token = localStorage.getItem("accessToken"); 
    
        try {
            const response = await api.get(`/api/users/search?nickName=${encodeURIComponent(input)}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
            setSearchResults([]);
        }
    };
    

    /** 🔹 친구 추가 */
    const handleAddFriend = (user) => {
        if (!invitedUsers.find(invited => invited.id === user.id)) {
            setInvitedUsers(prev => {
                const updatedList = [...prev, user];
                console.log("추가된 친구:", updatedList); // ✅ 이렇게 하면 바로 확인 가능
                return updatedList;
            });
        }
    };
    
    const handleInvite = async () => {
        if (!projectName.trim()) {
            alert("프로젝트명을 입력해주세요.");
            return;
        }
    
        if (invitedUsers.length === 0) {
            alert("한 명 이상의 팀원을 초대해야 합니다.");
            return;
        }
    
        if (!currentUser || !accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
    
        console.log("🧑‍💻 로그인 유저 정보:", currentUser);
    
        const requestBody = {
            projectName: projectName,
            members: invitedUsers.map(user => user.nickName)
        };
    
        // ✅ 서버 전송 전 로그 출력
        console.log("📦 서버로 전송할 데이터:");
        console.log(JSON.stringify(requestBody, null, 2));
    
        try {
            console.log("📤 POST 요청 시작: /api/projects/create");
    
            const response = await api.post(`/api/projects/create`, requestBody);
    
            console.log("✅ 서버 응답:", response.data);
    
            if (response.status === 200) {
                alert("✅ 프로젝트가 성공적으로 생성되고 초대가 전송되었습니다!");
                navigate("/invitecheck", { state: { invitedUsers } });
            }
        } catch (error) {
            console.error("❌ 초대 중 오류 발생:", error);
            if (error.response) {
                console.error("응답 상태 코드:", error.response.status);
                console.error("응답 데이터:", error.response.data);
            }
            alert("초대에 실패했습니다. 다시 로그인 후 시도해주세요.");
        }
    };
    
    return (
        <S.Container>
            <S.Header>
                <S.BackButton onClick={() => navigate("/")}> 
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
            </S.Header>
            <S.Nav>
                <StyledInput
                    height={57}
                    placeholder="프로젝트명을 설정해주세요"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
                <ListSearch 
                    userInput={userInput} 
                    setUserInput={setUserInput} 
                    onSearch={onSearch}
                    searchResults={searchResults}
                    onAddFriend={handleAddFriend} 
                />
            </S.Nav>
            <S.Main>
                <InvitedList>
                    {invitedUsers.length > 0 ? (
                        invitedUsers.map(user => (
                            <InvitedItem key={user.id}>
                                {user.nickName}
                            </InvitedItem>
                        ))
                    ) : (
                        <p>아직 초대한 친구가 없습니다.</p>
                    )}
                </InvitedList>
            </S.Main>
            <S.Button onClick={handleInvite}>
                팀원 초대 완료
            </S.Button>
        </S.Container>
    );
}

export { InvitePage };

