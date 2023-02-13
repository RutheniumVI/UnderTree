import React from 'react'
import io from 'socket.io-client';
import { useState } from 'react';

const socket = io.connect("http://localhost:8001");

function NewChat() {

    const [userName, setUsername] = useState("");
    const [room, setRoom] = useState("");

    const joinRoom = () => {
        if (userName != "" && room !=""){
            socket.emit("join_room", room) //room is sent as "data" in backend
            console.log(`User with socket ID ${socket.id} and username ${userName} joined the room`)
        }
    };

  return (
    <div>
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
  )
}

export default NewChat