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
    background: #FFFFFF;
    padding: 20px;
    border-radius: 15px;
    width: 80%;
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
    height: 43px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 40px;
    margin: 20px;
    background:${(props)=> props.color || "#EEEEEE"};
    color:rgb(48, 48, 48);
    font-size: 18px;
    font-style: normal;
    font-weight: bold;
    line-height: normal;
`;

export const Text = styled.div`
    font-size: 20px;
    color:rgb(34, 34, 34);
    font-style: normal;
    font-weight: bold;
    padding: 15px;
`;