import express, { Request, RequestHandler, Response } from "express";

import { AuthServices } from "./AuthServices.js";
import { AuthUtil } from "../utils/AuthUtil.js";
import { ProjectDB } from "../database_interface/ProjectDB.js";
import { FileDB } from "../database_interface/FileDB.js";
import { ProjectData } from "../data/ProjectData.js";
import { GitHubServices } from "./GitHubServices.js";
import { GitHubUtil } from "../utils/GitHubUtil.js";
import { FileUtil } from "../utils/FileUtil.js";

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
router.use(["/deleteProject","/editProject"], AuthUtil.authorizeProjectAccess);

router.route("/addProject").post(addProject);
router.route("/getProjects").get(getProjects);
router.route("/editProject").post(editProject);
router.route("/deleteProject").post(deleteProject);

async function addProject(req: Request, res: Response): Promise<void> {
	const data: ProjectData = req.body as ProjectData;
	const accessToken = res.locals.accessToken;

	try{
		await GitHubServices.createProject(data, accessToken);
		await GitHubUtil.addCollabsToRepo(data, accessToken, data.collaborators);
		await ProjectDB.addProject(data);
		await FileDB.initializeProjectFiles(data, res.locals.username);
		FileUtil.createDirectory(data.owner+"/"+data.projectName);
		res.status(200).json("Succesfully added project");
	} catch (err) {
		console.log(err);
		res.status(500).json("Failed to create project and add collaborators");
	}
}

async function getProjects(req: Request, res: Response): Promise<void>  {
	const username = res.locals.username;
	const projects: ProjectData[] = await ProjectDB.getProjects(username);
	res.status(200).json(projects);
}

async function editProject(req: Request, res: Response): Promise<void>  {
	const data: ProjectData = req.body as ProjectData;
	const accessToken = res.locals.accessToken;

	const savedProject: ProjectData = await ProjectDB.getProject(data.projectName, data.owner);

	const addedCollabs = data.collaborators.filter(collab => !savedProject.collaborators.includes(collab));
	const removedCollabs = savedProject.collaborators.filter(collab => !data.collaborators.includes(collab));

	try{
		if(addedCollabs !== undefined){
			await GitHubUtil.addCollabsToRepo(data, accessToken, addedCollabs);
		}
		if(removedCollabs !== undefined){
			await GitHubUtil.removeCollabsFromRepo(data, accessToken, removedCollabs);
		}
		const result = await ProjectDB.editProject(data);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
}

async function deleteProject(req: Request, res: Response): Promise<void>  {
	const data: ProjectData = req.body as ProjectData;

	try{
		FileUtil.deleteProjectDirectory(data.projectName, data.owner);
		await FileDB.deleteProjectFiles(data);
		const result = await ProjectDB.deleteProject(data);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
}

export { router };