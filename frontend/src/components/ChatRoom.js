import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import EmojiPicker from 'emoji-picker-react';
import './ChatRoom.css';

const ChatRoom = ({ username, recipient }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const latestMessageRef = useRef(null);

    useEffect(() => {
        const connectWebSocket = () => {
            const socket = new SockJS("http://localhost:8080/chat");
            const client = Stomp.over(socket);

            client.connect({}, () => {
                console.log("Connected to WebSocket");

                const topic = recipient
                    ? `/topic/private/${recipient}`
                    : `/topic/messages`;

                client.subscribe(topic, (msg) => {
                    const receivedMessage = JSON.parse(msg.body);

                    setMessages((prev) => [
                        ...prev,
                        {
                            username: receivedMessage.username,
                            message: receivedMessage.message,
                            timestamp: receivedMessage.timestamp || new Date().toLocaleTimeString(),
                            status: receivedMessage.status
                        }
                    ]);
                });

                stompClientRef.current = client;
                setIsConnected(true);

                const intervalId = setInterval(() => {
                    fetch("http://localhost:8080/active-users")
                        .then((res) => res.json())
                        .then((data) => setActiveUsers(data))
                        .catch((error) => console.error("❌ Failed to fetch active users:", error));
                }, 5000);

                return () => clearInterval(intervalId);
            });
        };

        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
                console.log("❌ Disconnected from WebSocket");
            }
        };
    }, [recipient]);

    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            const chatMessage = {
                username: username || "Anonymous",
                message: message || "Empty message",
                recipient: recipient || "",
                timestamp: new Date().toLocaleTimeString(),
                status: "Sent"
            };

            stompClientRef.current.send(
                "/app/sendMessage",
                {},
                JSON.stringify(chatMessage)
            );

            setMessage("");
        } else {
            console.error(" WebSocket is not connected!");
            alert("Failed to send message. Connection not established.");
        }
    };

    const handleMediaUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileURL = URL.createObjectURL(file);

        setMessages((prev) => [
            ...prev,
            {
                username,
                message: `📎 Sent an attachment`,
                media: fileURL,
                timestamp: new Date().toLocaleTimeString(),
                status: "Sent"
            }
        ]);
    };

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
        document.body.classList.toggle('dark-page', !darkMode);
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className={`chat-container ${darkMode ? 'dark-theme' : ''}`}>

            <div className="sidebar">
                <h3>Active Users</h3>
                <ul>
                    {activeUsers.length > 0 ? (
                        activeUsers.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))
                    ) : (
                        <li>No active users</li>
                    )}
                </ul>
            </div>

            <div className="chat-box">
                <div className="chat-header">
                    <h2>{recipient ? `Private Chat with ${recipient}` : "Group Chat"}</h2>
                </div>

                {/* Dark Mode & Media Upload */}
                <div className="top-controls">
                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>

                    <label className="media-btn">
                        📎 share media/files
                        <input type="file" accept="image/*, video/*" onChange={handleMediaUpload} hidden />
                    </label>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="messages">
                    {messages
                        .filter((msg) =>
                            msg.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            msg.message.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((msg, index) => (

                            <div key={index} ref={index === messages.length - 1 ? latestMessageRef : null} className={`message ${msg.username === username ? "sent" : "received"}`}>
                                <div className="profile-initials">
                                    {msg.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="message-bubble">
                                    <p><strong>{msg.username}</strong>: {msg.message}</p>

                                    {msg.media && (
                                        <div className="media-preview">
                                            <img src={msg.media} alt="Uploaded" style={{ maxWidth: "200px", borderRadius: "8px" }} />
                                        </div>
                                    )}

                                    <small>{msg.timestamp} • {msg.status}</small>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="input-container">
                    <button className="emoji-btn" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                        😊
                    </button>

                    {showEmojiPicker && (
                        <div className="emoji-picker-container">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}

                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />

                    <button onClick={sendMessage} disabled={!isConnected}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
