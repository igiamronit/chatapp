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
            };
            try{
                //console.log("Trying to write to:", `room/${room}/messages`);
                await addDoc(collection(db, "rooms", room, "messages"), messageData);
                //console.log('message sent');
            }
            catch(e){
                //console.error('error sending message',e);
            }
            await socket.emit('send_message', messageData);
            setMessageList((list) => [...list, { ...messageData, timestamp: { seconds: Date.now() / 1000 } }]);
            setCurrentMessage("");
            //await addDoc(collection(db, "room", room, "messages"), messageData);
            //setMessageList((list) => [...list, messageData]);
        }   
    }

    useEffect(() => {
        socket.off('receive_message').on('receive_message', (data) =>{
            //console.log(data);
            setMessageList((list) => [...list, data]);
        })
        return () => socket.removeListener('receive_message')
    }, [socket]);

    useEffect(() => {
        if(!room) return;
    
        const q = query(collection(db, "rooms", room, "messages"), orderBy("timestamp"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessageList(snapshot.docs.map(doc => doc.data()));
        });

        setMessageList((prevList) => {
            const seen = new Set();
            const combined = [...prevList, ...fetchedMessages].filter((msg) => {
              const id = `${msg.timestamp?.seconds}-${msg.author}-${msg.message}`;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            return combined;
          });
    
        return () => unsubscribe(); 
    }, [room]);  

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