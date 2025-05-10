import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add your message to the chat and emit it
    setChat((prev) => [...prev, { name: "You", message }]);
    socket.emit("message", message);
    setMessage("");
  };

  const nextStranger = () => {
    setChat([]);
    socket.emit("next");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat Boy</h2>

      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {chat.map((msg, index) => (
          <div key={index}>
            <strong>{msg.name}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          required
          style={{ width: "70%", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Send
        </button>
      </form>

      <div style={{ marginTop: "15px" }}>
        <button onClick={nextStranger} style={{ padding: "8px 20px" }}>
          Next Stranger
        </button>
      </div>
    </div>
  );
}

export default Chat;