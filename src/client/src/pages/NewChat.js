import React from 'react'

const exampleSocket = new WebSocket("ws://localhost:8000");

function NewChat() {

    const sendMessage = (message) => {
        exampleSocket.send("message")
    };

    exampleSocket.onopen = (event) => {
        exampleSocket.send("Here's some text that the server is urgently awaiting!");
      };

    exampleSocket.onmessage = (event) => {
      console.log(event.data);
      }
  return (
    <div>
        <button onClick={sendMessage}></button>
    </div>
  )
}

export default NewChat;