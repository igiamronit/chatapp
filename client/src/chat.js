import React, { useEffect, useState} from 'react'
import ScrollToBottom from 'react-scroll-to-bottom';
import {db} from './firebaseConfig';
import {collection, addDoc, serverTimestamp, query, orderBy, onSnapshot} from 'firebase/firestore';

function Chat({socket, username, room}) {
    const [currentMessage, setCurrentMessage] = React.useState("");
    const [messageList, setMessageList] = React.useState([]);


    const sendMessage = async () => {
        if(currentMessage !== ""){
            const messageData = {
                room: room,
                author: username,
                message : currentMessage,
                time : new Date().toLocaleTimeString(),
                timestamp: serverTimestamp()
            }

            await socket.emit('send_message', messageData);
            await addDoc(collection(db, "messages"), messageData);
            setMessageList((list) => [...list, messageData]);
        }   
    }

    useEffect(() => {
        socket.off('recieve_message').on('recieve_message', (data) =>{
            //console.log(data);
            setMessageList((list) => [...list, data]);
        })
        return () => socket.removeListener('receive_message')
    }, [socket]);

    useEffect(() => {
        if (!db) return; 
    
        const q = query(collection(db, "messages"), orderBy("timestamp"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessageList(snapshot.docs.map(doc => doc.data()));
        });
    
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);  

    return (
        <div className='chat-window'>
            <div className='chat-header'>
                <p>Live Chat</p>
            </div>
            <div className='chat-body'>
                <ScrollToBottom className='message-container'>
                {messageList.map((messageContent) => {
                    
                    return <div className='message' id = {username === messageContent.author? 'you' : 'other'}>
                      <div>
                        <div className='message-content'>
                            <p>{messageContent.message}</p>
                        </div>
                        <div className='message-meta'>
                            <p id='time'>{messageContent.time} </p>
                            <p id='author'>{messageContent.author}</p>
                        </div>
                      </div>  
                    </div>
                })}
                </ScrollToBottom>
            </div>
            <div className='chat-footer'>
                <input type = "text"
                 placeholder='Message'
                 onChange={(event) =>{
                    setCurrentMessage(event.target.value);
                }}
                onKeyDown={(event) => {
                    if(event.key === 'Enter') {
                        sendMessage();
                        event.target.value = "";
                        setCurrentMessage("");

                    }
                }}    
                />
                <button onClick={sendMessage} >&#9658;</button>
            </div>  
        </div>
    )
}

export default Chat;