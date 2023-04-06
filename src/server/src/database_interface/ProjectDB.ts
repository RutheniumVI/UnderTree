/*
Author: Faiq Ahmed
Date: March 3, 2023
Purpose: Project Database Interface Module, responsible for making changes to database for the projects collection
*/

import { DBClient } from "../utils/MongoDBUtil";
import { ProjectData } from "../data/ProjectData";

const collectionName = "projects";

// Check if a project with a specific owner already exists in the system
async function projectWithUserExists(projectName: string, owner: string, userName: string): Promise<boolean> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({
		"projectName": projectName, 
		"owner": owner,
	});

	console.log(existingProject);

	if(existingProject === null){
		return false;
	} else if (userName !== owner && !existingProject.collaborators.includes(userName)){
		return false;
	} else {
		return true;
	}
}

// Add project along with the owner
async function addProject(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject !== null){
		throw "Project with the following name already exists in the database";
	}
	try{
		await collection.insertOne(project);
	}
	catch (err) {
		console.log(err);
		throw "Failed to add project to database";
	}

	return "Succesfully added project";
}

// Get a specific project given the project name and the owner
async function getProject(projectName: string, owner: string): Promise<ProjectData> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": projectName, "owner": owner});

	if(existingProject === null){
		throw "The following project has recently been deleted, please refresh the browser";
	}

	return existingProject as ProjectData;
}

// Get all projects that a user is a owner of or a collaborator in
async function getProjects(userName: string): Promise<ProjectData[]> {
	const collection = DBClient.getCollection(collectionName);
	const cursor = await collection.find(
		{ $or: [
			{
				"owner": userName
			},
			{
				"collaborators": userName
			},
		]},
		{
			sort: { creationDate: -1 },
			projection: { _id: 0 }
		}
	);

	return cursor.toArray() as ProjectData[];
}

// Update information about a specific project
async function editProject(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject === null){
		throw "The following project has recently been deleted, please refresh the browser";
	}

	try{
		await collection.updateOne(
			{"projectName": project.projectName, "owner": project.owner},
			{
				$set: {
					"collaborators": project.collaborators
				}
			} 
		);
	} catch (err) {
		console.log(err);
		throw "Failed to edit project";
	}

	return "Succesfully edited project";
}

// Edit the latest commit information about a specific project
async function editProjectCommit(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject === null){
		throw "The following project does not exist";
	}

	try{
		await collection.updateOne(
			{"projectName": project.projectName, "owner": project.owner},
			{
				$set: {
					"commit": project.commit
				}
			} 
		);
	} catch (err) {
		console.log(err);
		throw "Failed to edit project commit";
	}

	return "Succesfully edited project commit";
}

// Delete a project from the database
async function deleteProject(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.deleteOne({"projectName": project.projectName, "owner": project.owner});

	if(result.deletedCount != 1){
		throw "The following project has recently been deleted, please refresh the browser";
	}

	return "Succesfully deleted project";
}

const ProjectDB = {
	projectWithUserExists,
	addProject,
	getProject,
	getProjects,
	editProject,
	editProjectCommit,
	deleteProject
};

export { ProjectDB };