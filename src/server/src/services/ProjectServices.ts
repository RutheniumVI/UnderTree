import express, { Request, RequestHandler, Response } from "express";

import { AuthServices } from "./AuthServices.js";
import { AuthUtil } from "../utils/AuthUtil.js";
import { ProjectDB } from "../database_interface/ProjectDB.js";
import { ProjectData } from "../data/ProjectData.js";

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
router.use("/editProject|deleteProject", AuthUtil.authorizeProjectAccess);

router.route("/addProject").post(addProject);
router.route("/getProjects").get(getProjects);
router.route("/editProject").post(editProject);
router.route("/deleteProject").post(deleteProject);

async function addProject(req: Request, res: Response): Promise<void> {
	const data: ProjectData = req.body as ProjectData;

	try{
		const result = await ProjectDB.addProject(data);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
}

async function getProjects(req: Request, res: Response): Promise<void>  {
	const username = res.locals.username;
	const projects: ProjectData[] = await ProjectDB.getProjects(username);
	res.status(200).json(projects);
}

async function editProject(req: Request, res: Response): Promise<void>  {
	const data: ProjectData = req.body as ProjectData;

	try{
		const result = await ProjectDB.editProject(data);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
}

async function deleteProject(req: Request, res: Response): Promise<void>  {
	const data: ProjectData = req.body as ProjectData;

	try{
		const result = await ProjectDB.deleteProject(data);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
}

export { router };