import './App.css';
import { io } from 'socket.io-client';
import React, { useState } from 'react';
import Chat from './chat';

const socket = io("https://chatapp-ylh8.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit('join_room', room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join a Chat Room</h3>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
