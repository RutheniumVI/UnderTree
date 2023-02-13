import React from 'react'
import io from 'socket.io-client';
import { useState } from 'react';
import { useEffect } from 'react';
import '../Styles/NewChat.css';


const socket = io.connect("http://localhost:8001");

function NewChat() {

    const [userName, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [currentMessage, setCurrentMessage] = useState("");

    const joinRoom = () => {
        if (userName !== "" && room !==""){
            socket.emit("join_room", room) //room is sent as "data" in backend
            console.log(`User with socket ID ${socket.id} and username ${userName} joined the room`)
        }
    };

    const sendMessage = async() => {
        if (currentMessage !== ""){
            const messageContent = {
                room: room,
                username: userName,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            }

            await socket.emit("send_message", messageContent);
        }
    }

    useEffect(() => {
        socket.on("receive_message", (data) =>{ 
        console.log(data)})
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
                <h3>chat</h3>
            </div>
            <div className='body'></div>
            <div className='footer'>
                <input
                id="message"
                type="text"
                placeholder="enter message"
                onChange={(event)=>{
                    setCurrentMessage(event.target.value);
                }}/>
                <button id="send-button" onClick={sendMessage}>send</button>
            </div>
        </div>
    </div>
  )
}

export default NewChat