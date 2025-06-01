import React, { useState } from 'react';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import './UsernamePage.css';  

const UsernamePage = () => {
    const [username, setUsername] = useState("");
    const [chatType, setChatType] = useState("");

    const enterChat = (type) => {
        setChatType(type);
    };

    return (
        <div className="username-container">
            {!chatType ? (
                <div className="username-box">
                    <h2>Welcome to Real-Time Chat!</h2>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="username-input"
                    />
                    <div className="button-group">
                        <button onClick={() => enterChat("group")} className="chat-btn">Group Chat</button>
                        <button onClick={() => enterChat("private")} className="chat-btn">Private Chat</button>
                    </div>
                </div>
            ) : (
                chatType === "group" ? (
                    <GroupChat username={username} />
                ) : (
                    <PrivateChat username={username} />
                )
            )}
        </div>
    );
};

export default UsernamePage;
