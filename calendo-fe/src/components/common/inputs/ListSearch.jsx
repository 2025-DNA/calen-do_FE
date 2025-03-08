import React, { useState } from "react";
import styled from "styled-components";
import InviteModal from "../modals/InviteModal";
import addIcon from "../../../assets/images/addmember.svg";

const SearchContainer = styled.div`
    position: relative;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 20px;
    height: 50px;
    border: 0px;
    box-shadow: 0 4px 14px rgba(229, 229, 229, 100);
    color: rgb(54, 54, 54);
    outline: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: 500;
`;

const SearchResultsPopup = styled.ul`
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #ddd;
    border-radius: 7px;
    list-style: none;
    padding: 5px 0;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    display: ${(props) => (props.visible ? "block" : "none")};
`;

const SearchItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
`;

const AddFriendButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
        color: #f88b8b;
    }
`;

function ListSearch({ userInput, setUserInput, onSearch, searchResults, onAddFriend }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddFriendClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleConfirmInvite = () => {
        if (selectedUser) {
            onAddFriend(selectedUser);  // 초대 리스트에 추가
        }
        setIsModalOpen(false);
    };

    return (
        <SearchContainer>
            <SearchInput
                type="text"
                placeholder="아이디를 검색하세요"
                value={userInput}
                onChange={(e) => onSearch(e.target.value)}
            />
            <SearchResultsPopup visible={searchResults.length > 0}>
                {searchResults.map((user) => (
                    <SearchItem key={user.id}>
                        <span>{user.nickName}</span>
                        <AddFriendButton onClick={() => handleAddFriendClick(user)}>
                            <img src={addIcon} alt="add" width="24" height="24" />
                        </AddFriendButton>
                    </SearchItem>
                ))}
            </SearchResultsPopup>

            {/* 초대 모달 */}
            {isModalOpen && selectedUser && (
                <InviteModal onConfirm={handleConfirmInvite} onCancel={() => setIsModalOpen(false)} />
            )}
        </SearchContainer>
    );
}


export default ListSearch;
