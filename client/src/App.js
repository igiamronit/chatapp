import logo from './logo.svg';
import './App.css';
import {io} from 'socket.io-client'
import React, {useState} from 'react'
import Chat from './chat'

const socket = io("https://chatapp-ylh8.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if(username !== "" && room !== ""){
      socket.emit('join_room', room);
      setShowChat(true);
    }
  }


  return (
    <div className="App">
      {!showChat ?
      (
      <div className='joinChatContainer'>
      <h3>Join A Chat</h3>
      <input type="text" placeholder="Enter your name" onChange = {(event) => {
        setUsername(event.target.value);
      }} />
      <input type="text" placeholder="Enter room ID" onChange = {(event) => {
        setRoom(event.target.value);
      }}/>
      <button onClick = {joinRoom}>Join A Room</button>
      </div>
      ):(

      <Chat socket = {socket}  username = {username} room = {room}/>
      )}
    </div>
  );
}

console.log("Firebase Key:", process.env.REACT_APP_FIREBASE_API_KEY);


export default App;
