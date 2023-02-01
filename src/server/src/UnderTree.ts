import cors from 'cors'
import express from 'express'
import http from 'http'

import { DBClient } from './utils/MongoDBUtil.js';
import {router as projectRoutes} from './services/ProjectServices.js';

const app = express();
app.use(cors({
    origin: "*"
}))
const server = http.createServer(app);

await main();

server.listen(8000, () => {
    console.log('listening on *8000');
});

async function main(){
    await DBClient.connect();
    console.log("Connected successfully to database");

    app.use(express.json());
    app.use("/api/projects", projectRoutes);
}
