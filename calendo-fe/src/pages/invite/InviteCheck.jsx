import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as S from "./styled";

const Header = styled.div`
    display: flex;
    justify-content: center;
    font-size: 30px;
    font-weight: 600;
    padding: 20px;
    margin-top: 50px;
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

function InviteCheck() {
    const location = useLocation();
    const navigate = useNavigate();
    const invitedUsers = location.state?.invitedUsers || []; // 초대된 친구 목록 가져오기

    return (
        <S.Container>
            <Header>팀 초대 인원 확인</Header>
            <S.Main>
                <InvitedList>
                    {invitedUsers.length > 0 && (
                        invitedUsers.map(user => (
                            <InvitedItem key={user.id}>{user.nickName}</InvitedItem>
                        ))
                    )}
                </InvitedList>
            </S.Main>
            <S.Button onClick={() => navigate("/whole-schedule")}>
                방 생성하기
            </S.Button>
        </S.Container>
    );
}

export { InviteCheck };
