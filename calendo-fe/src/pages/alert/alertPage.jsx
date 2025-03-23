import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import * as S from "./styled"
import api from "../../services/api";
import backIcon from "../../assets/icons/backbtn.svg";
import AlertItem from "../../components/common/list/alertItem"
import NotiModal from "../../components/common/modals/notifiModal"


const NoAlertsMessage = styled.p`
    margin-top: 50px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: #444;
`;

function AlertPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);  
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [alerts, setAlerts] = useState([]); // 알림 리스트

    // 알림 클릭 시 모달 열기 & 선택한 알림 저장
    const handleAlertClick = (alert) => {
        setSelectedAlert(alert); 
        setIsModalOpen(true);
    };

    // 모달 닫기
    const closeModal = () => setIsModalOpen(false);

    // 알림 수락 요청
    const handleConfirm = async () => {
        if (!selectedAlert) return;

        try {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }

            const response = await api.put(`/api/notifications/${selectedAlert.id}/respond`, 
                { status: "ACCEPTED" }, // 서버에 수락 상태 전달
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            console.log("✅ 알림 수락 완료:", response.data);
            alert("알림을 수락하였습니다.");

            // UI에서 해당 알림 제거
            setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== selectedAlert.id));

            closeModal(); // 모달 닫기
        } catch (error) {
            console.error("❌ 알림 수락 실패:", error);
            alert("알림을 수락하는 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {


        const fetchAlerts = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");

                if (!accessToken) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }

                const response = await api.get(`api/notifications`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log("📢 알림 데이터:", response.data);
                setAlerts(response.data);
            } catch (error) {
                console.error("❌ 알림 불러오기 실패:", error);
                alert("알림을 불러오는 중 오류가 발생했습니다.");
            }
        };

        fetchAlerts();
    }, []);

    return(
        <S.Container>
            <S.Header>
                <S.BackButton onClick={()=>navigate(-1)}>
                    <img src={backIcon} alt="Back" width="32" height="32" />
                </S.BackButton>
                <S.Title>알림</S.Title>
            </S.Header>
            <S.Nav>
                <S.SubTitle>{alerts.length}개의 안 읽은 알림</S.SubTitle>
            </S.Nav>
            <S.Main>
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <AlertItem 
                            key={alert.id} 
                            post={alert} 
                            onClick={() => handleAlertClick(alert)}
                        />
                    ))
                ) : (
                    <NoAlertsMessage>알림이 없습니다</NoAlertsMessage>
                )}
            </S.Main>

            {isModalOpen && (
                <NotiModal onConfirm={handleConfirm} onCancel={closeModal} />
            )}
        </S.Container>
    );
}

export default AlertPage;
