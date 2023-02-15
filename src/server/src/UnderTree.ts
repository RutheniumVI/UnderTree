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
import { router as chatRoutes } from './services/ChatServices.js';
import runChatServer from './services/ChatSocket.js';

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


async function main(){
    await DBClient.connect();
    FileUtil.setUpFileSystem();
    console.log("Connected successfully to database");

    runChatServer();
    app.use(express.json());
    app.use("/api/projects", projectRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/file", fileRoutes);
    app.use("/api/github", githubRoutes);
    app.use("/api/chat", chatRoutes);
}
