import React, { useState } from "react";
import ChatRoom from "./ChatRoom";

const PrivateChat = ({ username }) => {
const [recipient, setRecipient] = useState("");

return (
    <div>
    <h2>Private Chat</h2>
    <input
    type="text"
    placeholder="Recipient Username"
    value={recipient}
  onChange={(e) => setRecipient(e.target.value)}
     />
            {recipient && <ChatRoom username={username} recipient={recipient} />}
        </div>
    );
};

export default PrivateChat;