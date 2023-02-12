import cors from 'cors';
import express from 'express';
import http from 'http';
import cookieParser from "cookie-parser"; 

import { FileUtil } from './utils/FileUtil.js';
import { DBClient } from './utils/MongoDBUtil.js';
import { router as projectRoutes } from './services/ProjectServices.js';
import { router as authRoutes } from './services/AuthServices.js';
import { router as fileRoutes } from './services/FileServices.js';
import { router as githubRoutes } from './services/GitHubServices.js';
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))
app.use(cookieParser());
const server = http.createServer(app);

await main();

server.listen(8000, () => {
    console.log('listening on *8000');
});

const wss = new WebSocketServer({server:server});

wss.on('connection', function connection(ws) {
    console.log('new client connection');
    ws.send('this message was sent to new client from server');

    //recieving message from client
    ws.on('message', function message(data) {
      console.log('received: %s', data);
      //replies to client
      ws.send('received message from client:' + data);
    });
  
  });


async function main(){
    await DBClient.connect();
    FileUtil.setUpFileSystem();
    console.log("Connected successfully to database");

    app.use(express.json());
    app.use("/api/projects", projectRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/file", fileRoutes);
    app.use("/api/github", githubRoutes);
}
