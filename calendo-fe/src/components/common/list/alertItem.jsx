import React from "react";
import styled from "styled-components";
import clock from "../../../assets/images/clock.svg"

const Wrapper = styled.div`
    width: 100%;
    padding: 0 35px;
    height: 95px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 2px;
    border-bottom: 1.5px solid #DEDEDE;
`;

const ContentWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    align-items: flex-start;
    justify-content: center;
`;

const TitleText = styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    margin-top: 5px;
`;

const ContentText = styled.p`
    font-size: 11px;
    font-weight: 500;
    color:rgb(185, 185, 185);
    margin-top: 8px;
`;

function AlertItem({ post, onClick }) {
    return (
        <Wrapper onClick={onClick}>
            <img src={clock} alt="Back" width="24" height="24" />
            <ContentWrapper>
                <TitleText>{post?.message}</TitleText>
                <ContentText>수락을 원하신다면 해당 알림을 확인해주세요</ContentText>
            </ContentWrapper>
        </Wrapper>
    );
}

export default AlertItem;
