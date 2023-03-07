import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const chatapp = express();
const chatserver = http.createServer(chatapp);

function runChatServer(){

  const io = new Server(chatserver, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    }
  })

  io.on("connection", (socket)=> {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data)=>{
      socket.join(data)
    })

    socket.on("send_message", (data) => {
      io.to(data.room).emit("receive_message", data);
    })

    socket.on("disconnect", ()=> {
      console.log("User Disconnected", socket.id);
    });
  }); 

  chatserver.listen(8001, ()=> {
    console.log('listening on *8001');
  })
}



export default runChatServer;