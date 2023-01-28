import express from 'express'
import http from 'http'

import {router as projectRoutes} from './services/ProjectServices.js';

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use("/api/projects", projectRoutes);

server.listen(3000, () => {
    console.log('listening on *:3000');
});