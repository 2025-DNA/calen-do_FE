import React, { useState } from "react";
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
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    /*유저 검색*/
    const onSearch = async (input) => {
        setUserInput(input);

        if (input.trim() === "") {
            setSearchResults([]);
            return;
        }

        try {
            const response = await api.get(`/users/search?nickName=${encodeURIComponent(input)}`, {
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
            setInvitedUsers([...invitedUsers, user]);
        }
    };

    /** 🔹 초대한 유저 서버에 전송 */
    const handleInvite = async () => {
        console.log("🔍 저장된 accessToken:", localStorage.getItem("accessToken"));
    
        if (!projectName.trim()) {
            alert("프로젝트명을 입력해주세요.");
            return;
        }
    
        if (invitedUsers.length === 0) {
            alert("한 명 이상의 팀원을 초대해야 합니다.");
            return;
        }
    
        // 현재 로그인한 유저 정보 (localStorage에서 가져오기)
        const currentUser = {
            email: localStorage.getItem("userEmail"),  
            nickname: localStorage.getItem("userNickname"),  
            id: parseInt(localStorage.getItem("userId"), 10) 
        };

        console.log("로그인 유저정보 : ", currentUser);
    
        // API가 기대하는 invitations 데이터 변환 (email 포함)
        const invitations = invitedUsers.map(user => ({
            email: user.email, // ✅ 이메일 포함
            nickname: user.nickName,
            message: `${currentUser.email}님이 '${projectName}' 프로젝트에 ${user.nickName}님을 초대하셨습니다.`
        }));
    
        // 요청 바디 구성
        const requestBody = {
            projectName,
            invitations, // ✅ 초대한 친구 리스트
            createdBy: currentUser
        };
    
        try {
            const response = await api.post("/api/projects/create", requestBody, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
                }
            });
    
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
            alert("초대에 실패했습니다.");
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
