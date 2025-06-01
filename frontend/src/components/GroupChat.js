import React from 'react';
import ChatRoom from './ChatRoom';

const GroupChat = ({ username }) => {
    return (
        <div>
            <ChatRoom username={username} recipient={""} />
        </div>
    );
};
export default GroupChat;