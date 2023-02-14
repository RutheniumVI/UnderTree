import React from 'react'
import io from 'socket.io-client';
import { useState } from 'react';
import { useEffect } from 'react';
import '../Styles/NewChat.css';
import {v4 as uuidv4} from 'uuid';
import './profile.PNG'


const socket = io.connect("http://localhost:8001");

function NewChat() {

    const [userName, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);


    const joinRoom = () => {
        if (userName !== "" && room !==""){
            socket.emit("join_room", room) //room is sent as "data" in backend
            console.log(`User with socket ID ${socket.id} and username ${userName} joined the room`)
        }
    };

    const sendMessage = async() => {
        if (newMessage !== ""){
            const messageContent = {
                room: room,
                username: userName,
                message: newMessage,
                time: new Date,
                id: uuidv4(),
            }

            await socket.emit("send_message", messageContent);
        }
    }

    useEffect(() => {
        console.log(socket)
        socket.on("receive_message", (data) =>{ 
            //console.log("received" + data)
            setMessages((list) => [...list, data]);
        })
    }, [socket]);

  return (
    <div>
        <div className='form'>
            <h3>Join a Chat</h3>
            <input type="text" 
            placeholder='John..'
            onChange={(event)=> {
                setUsername(event.target.value);
            }}/>
            <input type="text" 
            placeholder='RoomID..'
            onChange={(event)=> {
                setRoom(event.target.value);
            }}/>
            <div>
                <button onClick={joinRoom}>CLICK ME</button>
            </div>
        </div>
        <div className='chat'>
            <div className='header'>
                <h3></h3>
            </div>
            <div className='body'>
                {messages.map((messageData) => {
                    if (userName == messageData.username){
                    return <div className='message-blurb' id={userName == messageData.username ? "me" : "others"} key={messageData.id}>
                                <div className='message-border'>
                                    <p id="user" style={{textAlign:"right"}}>{messageData.username}</p>
                                    <div className='message-text'>
                                        <p id="message-content">{messageData.message}</p>
                                    </div>
                                </div>
                                <div className='avatar'>
                                    <img className='avatar-pic' src={require('./profile.PNG')}/>
                                </div>
                           </div>}
                           else return <div className='message-blurb' id={userName == messageData.username ? "me" : "others"} key={messageData.id}>
                           <div className='avatar'>
                               <img className='avatar-pic' src={require('./profile.PNG')}/>
                           </div>
                           <div className='message-border'>
                               <p id="user">{messageData.username}</p>
                               <div className='message-text'>
                                   <p id="message-content">{messageData.message}</p>
                               </div>
                           </div>
                      </div>
                })}
            </div>
            <div className='footer'>
                <input
                id="message"
                type="text"
                placeholder="enter message"
                onChange={(event)=>{
                    setNewMessage(event.target.value);
                }}/>
                <button type="button" className="btn btn-dark tiny-btn" id="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    </div>
  )
}

export default NewChat