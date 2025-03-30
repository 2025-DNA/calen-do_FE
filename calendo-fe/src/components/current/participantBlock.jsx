import React from 'react';
import styled from "styled-components";

const Block = styled.div`
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 12px;

  color: ${({ $isChecked }) => ($isChecked ? "#EA6B6B" : "#A9A9A9")};
  /* 분홍: #EA6B6B / 회색: #A9A9A9 */
`;

const ParticipantsBlock = ({ participant, status = "unchecked" }) => {
  const isChecked = status === "checked";
  return <Block $isChecked={isChecked}>{participant}</Block>;
};

export default ParticipantsBlock;
