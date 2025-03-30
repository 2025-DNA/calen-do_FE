import styled from "styled-components";

export const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-contents: center;
    align-items: center;
    width: 100%;
    max-width: 412px;
    height: 100vh;
    background: #FFFDFD;
    margin: 0px auto;
    overflow: auto;
`;

export const Header = styled.div`
    display: flex;
    justify-content: center; 
    align-items: center;     
    position: relative;       
    width: 95%;
    padding: 20px;
`;


export const BackButton = styled.button`
    position: absolute;
    left: 20px;
    background: none;
    border: none;
    cursor: pointer;
`;


export const Title = styled.h1`
    font-size: 25px;
    font-weight: 600;
    text-align: center;
    flex-grow: 1; 
    margin: 0px;
`;


export const Body = styled.div`
    position: relative;
    margin-top: 30px;
    width: 85%;
    padding-bottom: 20px;
    height: 60vh; 
    overflow: auto;
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: separate; /* ✅ 셀의 경계를 개별적으로 유지 */
    border-spacing: 0; /* ✅ 셀 사이의 간격 제거 */
    text-align: center;
    color: #545454;
    background-color: #FFFFFF;
    margin-bottom: 60px;
    table-layout: fixed;
    border-radius: 10px;
    border: 1px solid ##dfdfdf; /* ✅ 테이블 전체 테두리 */
    overflow: hidden;

    th, td {
        width: 70px;
        height: 23px;
        font-weight: 400;
        line-height: 130%;
        overflow: hidden;
        white-space: nowrap;
        border: 1px solid #dfdfdf; /* ✅ 개별 셀 테두리 유지 */
    }

    /* ✅ 테이블 상단 헤더 스타일 */
    thead {
        position: sticky;
        height: 33px;
        font-size: 15px;
        top: 0;
        z-index: 20;
        background-color: #FFFFFF;
        border-bottom: 1px solid #dfdfdf; /* ✅ 헤더와 본문을 구분하는 선 추가 */
    }

    /* ✅ 첫 번째 열(시간) 스타일 */
    td:first-child, th:first-child {
        width: 55px;
        position: sticky;
        font-size: 13px;
        left: 0;
        z-index: 15;
        background-color: #FFFFFF;
        border-right: 1px solid #dfdfdf; /* ✅ 시간 칸의 오른쪽 테두리를 더 두껍게 설정 */
    }

    /* ✅ 둥근 테두리 적용 */
    thead th:first-child {
        border-top-left-radius: 10px;
    }

    thead th:last-child {
        border-top-right-radius: 10px;
    }

    tbody tr:last-child td:first-child {
        border-bottom-left-radius: 10px;
    }

    tbody tr:last-child td:last-child {
        border-bottom-right-radius: 10px;
    }
        
    thead {
        position: sticky;
        background-color: #FFFFFF;
        top: 0;
        z-index: 20;
    }

    td:first-child, th:first-child {
        position: sticky;
        left: 0;
        z-index: 15;
        background-color: #FFFFFF; /* 고정된 열의 배경색 */
    }

    td.mine {
        background-color:rgb(247, 212, 224);
    }

    td.others-1 {
        background-color:rgb(243, 195, 213);
    }

    td.others-2 {
        background-color:rgb(236, 168, 200);
    }

    td.others-3 {
        background-color:rgb(224, 146, 182);
    }

    td.both {
        background-color:rgb(214, 117, 154);
    }
`;


export const Bottom = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0px;
    max-width: 412px;
    width: 100%;
    height: 80px;
    background:#FFF8F8;
    border-radius: 14px 14px 0 0;
    z-index: 100;
    gap: 15px;
    padding: 20px;
`;

export const SelectButton1 = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 200px);
    height: 44px;
    margin: 0px auto;
    background-color:rgb(253, 181, 181);
    color: white;
    font-size: 20px;
    font-weight: 600;
    border: none;
    border-radius: 13px;
`;

export const SelectButton2 = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 80px);
    height: 44px;
    margin: 0px auto;
    background-color: #EA6B6B;
    color: white;
    font-size: 20px;
    font-weight: 600;
    border: none;
    border-radius: 13px;
`;

export const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    width: 90%;
`;

export const SubTitle = styled.h3`
    font-size: 15px;
    font-weight: 500;
    color: #666;
    text-align: center;
    flex-grow: 1; 
    margin: 0px;
`;

export const ProgressBarWrapper = styled.div`
    margin: 10px 0;
`;

export const Participants = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
    color: #666;
    background-color: transparent;

`;


export const Bodys = styled.div`
    position: relative;
    margin-top: 30px;
    width: 85%;
    padding-bottom: 20px;
    height: calc(100vh - 100px); 
    overflow: auto;
`;

export const Tables = styled.table`
    width: 100%;
    border-collapse: separate; /* ✅ 셀의 경계를 개별적으로 유지 */
    border-spacing: 0; /* ✅ 셀 사이의 간격 제거 */
    text-align: center;
    color: #545454;
    background-color: #FFFFFF;
    margin-bottom: 60px;
    table-layout: fixed;
    border-radius: 10px;
    border: 1px solid ##dfdfdf; /* ✅ 테이블 전체 테두리 */
    overflow: hidden;

    th, td {
        width: 70px;
        height: 23px;
        font-weight: 400;
        line-height: 130%;
        overflow: hidden;
        white-space: nowrap;
        border: 1px solid #dfdfdf; /* ✅ 개별 셀 테두리 유지 */
    }

    /* ✅ 테이블 상단 헤더 스타일 */
    thead {
        position: sticky;
        height: 33px;
        font-size: 15px;
        top: 0;
        z-index: 20;
        background-color: #FFFFFF;
        border-bottom: 1px solid #dfdfdf; /* ✅ 헤더와 본문을 구분하는 선 추가 */
    }

    /* ✅ 첫 번째 열(시간) 스타일 */
    td:first-child, th:first-child {
        width: 55px;
        position: sticky;
        font-size: 13px;
        left: 0;
        z-index: 15;
        background-color: #FFFFFF;
        border-right: 1px solid #dfdfdf; /* ✅ 시간 칸의 오른쪽 테두리를 더 두껍게 설정 */
    }

    /* ✅ 둥근 테두리 적용 */
    thead th:first-child {
        border-top-left-radius: 10px;
    }

    thead th:last-child {
        border-top-right-radius: 10px;
    }

    tbody tr:last-child td:first-child {
        border-bottom-left-radius: 10px;
    }

    tbody tr:last-child td:last-child {
        border-bottom-right-radius: 10px;
    }
        
    thead {
        position: sticky;
        background-color: #FFFFFF;
        top: 0;
        z-index: 20;
    }

    td:first-child, th:first-child {
        position: sticky;
        left: 0;
        z-index: 15;
        background-color: #FFFFFF; /* 고정된 열의 배경색 */
    }

    .selected {
        background-color: #FFB5B5; /* ✅ 선택된 시간 칸 스타일 */
    }
`;


export const Bottoms = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0px;
    max-width: 412px;
    width: 100%;
    height: 80px;
    background:#FFF8F8;
    border-radius: 14px 14px 0 0;
    z-index: 100;
`;

export const SelectButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 80px);
    height: 44px;
    margin: 0px auto;
    background-color: #EA6B6B;
    color: white;
    font-size: 20px;
    font-weight: 600;
    border: none;
    border-radius: 7px;
`;
