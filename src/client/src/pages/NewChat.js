import React from 'react'
import io from 'socket.io-client';

const socket = io.connect("http://localhost:8001");

function NewChat() {
  return (
    <div>newChat</div>
  )
}

export default NewChat