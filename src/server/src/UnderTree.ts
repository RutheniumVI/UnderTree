import cors from 'cors';
import express from 'express';
import http from 'http';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { FileUtil } from './utils/FileUtil';
import { DBClient } from './utils/MongoDBUtil';

import { router as projectRoutes } from './services/ProjectServices';
import { router as authRoutes } from './services/AuthServices';
import { router as fileRoutes } from './services/FileServices';
import { router as githubRoutes } from './services/GitHubServices';

import {WebSocketServer } from "ws";
import * as Y from "yjs";
import { PersistenceUtil } from "./utils/PersistenceUtil"
import { MongodbPersistence } from "y-mongodb-provider";
import yUtils from "y-websocket/bin/utils";

dotenv.config();
import { router as chatRoutes } from './services/ChatServices';
import runChatServer from './services/ChatSocket';

const app = express();
app.use(cors({
    origin: process.env.FULL_DOMAIN_URL,
    credentials: true,
}))
app.use(cookieParser());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    //get JWT token from url
    console.log(req.url);
    const jwt_token = req.url.split("jwt=")[1];
    //TODO: handling auth for jwt

    yUtils.setupWSConnection(ws, req);
});

yUtils.setPersistence({
  bindState: async (docName, ydoc) => {

    //Initial sync
    const mdb = PersistenceUtil.mdb;
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates)
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    console.log("I applied update: ", docName)

    ydoc.on('update', async (update) => {
        mdb.storeUpdate(docName, update);
    })
  },
  writeState: async (docName, ydoc) => {
    return new Promise(resolve => {
      resolve(0);
    })
  }
})


// server.on('upgrade', function upgrade(request, socket, head) {
//     console.log(request);
// });
main();

async function main(){
    await DBClient.connect();
    FileUtil.setUpFileSystem();
    console.log("Connected successfully to database");

    runChatServer();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api/projects", projectRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/file", fileRoutes);
    app.use("/api/github", githubRoutes);
    app.use("/api/chat", chatRoutes);

    server.listen(8000, () => {
        console.log('listening on *8000');
    });
}

export default app;