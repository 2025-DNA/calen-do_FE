import styled from "styled-components";

export const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 412px;
    height: calc(30px + 100vh);
    margin: 0 auto;
    overflow: hidden;
    background-color: #FFFDFD;
`;

export const Header = styled.header`
    width: 95%;
    height: 44px;
    display: flex;
    align-items: center;
    position: relative;     
    padding: 20px;
    margin-top: 20px;
`;

export const BackButton = styled.button`
    position: absolute;
    background: none;
    border: none;
    cursor: pointer;
`;

export const Nav = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 95%;
    margin-top: 30px;
`;

export const Main = styled.main`
    display: flex;
    flex-direction: column;
    margin-top: 15px;
    align-items: center;
    margin-bottom: 10px;
    width: 90%;
    height: 100vh;
    background-color: #fff;
    border-radius: 10px;
`;


export const ResultItem = styled.div`
    display: flex;
    width: 90%;
    justify-content: space-between;
    align-items: center;
    padding: 15px 5px;
    font-size: 20px;
`;


export const Button = styled.div`
    display: flex;
    align-items: center;  /* 수직 가운데 정렬 */
    justify-content: center; /* 수평 가운데 정렬 */
    width: 70%;
    background-color: #EA6B6B;
    border-radius: 12px;
    color: white;
    padding: 15px 5px;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 40px;
`;

