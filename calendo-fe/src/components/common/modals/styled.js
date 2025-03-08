import styled from "styled-components";

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: #FFF;
    padding: 20px;
    border-radius: 15px;
    width: 70%;
    position: relative;
`;

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
`;

export const Button = styled.div`
    display: flex;
    width: 92px;
    height: 34px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 36px;
    margin: 25px;
    background: #EEEEEE;
    color: #000;
    font-size: 18px;
    font-style: normal;
    font-weight: bold;
    line-height: normal;
`;

export const Text = styled.div`
    font-size: 20px;
    font-style: normal;
    font-weight: bold;
    padding: 20px;
`;