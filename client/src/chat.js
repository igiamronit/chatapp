import React, { useEffect, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const messageData = {
        room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, 'rooms', room, 'messages'), messageData);
      } catch (e) {
        // handle error if needed
      }

      socket.emit('send_message', messageData);
      setMessageList((list) => [
        ...list,
        { ...messageData, timestamp: { seconds: Date.now() / 1000 } },
      ]);
      setCurrentMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    if (!room) return;

    const q = query(
      collection(db, 'rooms', room, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessageList(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [room]);

  return (
    <div className='chat-window'>
      <div className='chat-header'>
        <p>💬 Live Chat</p>
      </div>

      <div className='chat-body'>
        <ScrollToBottom className='message-container'>
          {messageList.map((msg, index) => (
            <div
              className='message'
              id={username === msg.author ? 'you' : 'other'}
              key={index}
            >
              <div>
                <div className='message-content'>
                  <p>{msg.message}</p>
                </div>
                <div className='message-meta'>
                  <p id='time'>{msg.time}</p>
                  <p id='author'>{msg.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>

      <div className='chat-footer'>
        <input
          type='text'
          placeholder='Type your message...'
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
              setCurrentMessage('');
            }
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
