import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
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

    const mockUsers = [
        { id: 1, nickName: "김철수" },
        { id: 2, nickName: "김영희" },
        { id: 3, nickName: "김지성" },
        { id: 4, nickName: "손흥민" },
        { id: 5, nickName: "유재석" },
        { id: 6, nickName: "강호동" },
    ];

    const isMock = true;

    const onSearch = async (input) => {
        setUserInput(input);

        if (input.trim() === "") {
            setSearchResults([]);
            return;
        }

        if (isMock) {
            const filteredResults = mockUsers.filter(user =>
                user.nickName.includes(input)
            );
            setSearchResults(filteredResults);
        } else {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/search`, {
                    params: { nickName: input },
                    withCredentials: true
                });
                setSearchResults(response.data);
            } catch (error) {
                console.error("검색 중 오류 발생:", error);
                setSearchResults([]);
            }
        }
    };

    const handleAddFriend = (user) => {
        if (!invitedUsers.find(invited => invited.id === user.id)) {
            setInvitedUsers([...invitedUsers, user]);
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
            <S.Button onClick={() => navigate("/invitecheck", { state: { invitedUsers } })}>
                팀원 초대 완료
            </S.Button>
        </S.Container>
    );
}

export { InvitePage };
