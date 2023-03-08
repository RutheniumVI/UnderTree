import express, { Request, RequestHandler, Response } from "express";

import { AuthServices } from "./AuthServices";
import { AuthUtil } from "../utils/AuthUtil";
import { ProjectDB } from "../database_interface/ProjectDB";
import { FileDB } from "../database_interface/FileDB";
import { ProjectData } from "../data/ProjectData";
import { GitHubUtil } from "../utils/GitHubUtil";
import { FileUtil } from "../utils/FileUtil";
import { File, FileData } from "../data/FileData";
import { PersistenceUtil } from "../utils/PersistenceUtil";

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
router.use(["/deleteProject","/editProject"], AuthUtil.authorizeProjectAccess);

router.route("/addProject").post(addProject);
router.route("/getProjects").get(getProjects);
router.route("/editProject").post(editProject);
router.route("/deleteProject").post(deleteProject);
router.route("/importProjects").post(importProjects);

const latexTemplate = "\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}"

async function addProject(req, res): Promise<void> {
	const data: ProjectData = req.body as ProjectData;
	const accessToken = res.locals.accessToken;

	try{
		// await GitHubUtil.createProject(data, accessToken);
		// await GitHubUtil.addCollabsToRepo(data, accessToken, data.collaborators);
		await ProjectDB.addProject(data);
		await FileDB.initializeProject(data);
		const filePath = data.owner+"/"+data.projectName+"/main.tex";
		const mainFile: File = {fileName: "main.tex", fileType: "tex", filePath: filePath, contributors: [res.locals.username], documentID: filePath}
		await PersistenceUtil.writeDocumentData(filePath, latexTemplate);
		await FileDB.addProjectFile(data, mainFile);
		await FileUtil.createDirectory(data.owner+"/"+data.projectName);
		res.status(200).json("Successfully added project");
	} catch (err) {
		console.log(err);
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

async function importProjects(req: Request, res: Response): Promise<void>  {
	let data: ProjectData[] = req.body as ProjectData[]
	const accessToken = res.locals.accessToken;

	try{
		for(let i = 0; i < data.length; i++){
			const project = await GitHubUtil.getRepoCollaborators(accessToken, data[i]);
			const files = await GitHubUtil.getRepoContent(accessToken, project);
			await FileDB.initializeProject(project);
			files.imageFiles.forEach(async (file) => {
				const fileContent = await GitHubUtil.getContentFromBlob(accessToken, project, file);
				const filePath = project.owner+"/"+project.projectName+"/"+file.path;
				FileUtil.saveFile(filePath, Buffer.from(fileContent.content, fileContent.encoding as BufferEncoding));
				const fileInfo: File = {fileName: file.name, fileType: "image", filePath: filePath, contributors: [project.owner, ...project.collaborators]}
				FileDB.addProjectFile(project, fileInfo);
			})

			files.texFiles.forEach(async (file) => {
				const fileContent = await GitHubUtil.getContentFromBlob(accessToken, project, file);
				console.log(fileContent.content);
				const filePath = project.owner+"/"+project.projectName+"/"+file.path;
				const fileInfo: File = {fileName: file.name, fileType: "tex", filePath: filePath, contributors: project.collaborators, documentID: file.path};
				await PersistenceUtil.writeDocumentData(filePath, Buffer.from(fileContent.content, fileContent.encoding as BufferEncoding).toString());
				FileDB.addProjectFile(project, fileInfo);
			})
			await ProjectDB.addProject(project);
		}
		res.status(200).json("Successfully imported project");
	} catch (err) {
		console.log(err);
		res.status(500).json("Failed to import all projects");
	}
}

export { router, addProject, deleteProject };