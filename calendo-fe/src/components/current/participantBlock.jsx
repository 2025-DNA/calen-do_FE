import React from 'react';
import styled from "styled-components";

const Block = styled.div.attrs(() => ({}))`
  background-color: ${({ $isFilled }) => ($isFilled ? "#000" : "#ccc")};
`;

const ParticipantsBlock = ({ participant }) => {
    const isFilled = participant !== "?";
    return <Block $isFilled={isFilled}>{participant}</Block>;
};


export default ParticipantsBlock;
