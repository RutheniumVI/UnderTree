import express from 'express';

import { ProjectDB } from '../database_interace/ProjectDB.js';
import { ProjectData } from '../data/ProjectData.js';

const router = express.Router();

router.route("/addProject").post(addProject);

async function addProject(req, res){

    const data: ProjectData = JSON.parse(JSON.stringify(req.body));
    const result = await ProjectDB.addProject(data)
    res.json(result);

}

export { router };