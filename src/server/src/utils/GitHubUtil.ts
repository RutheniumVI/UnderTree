/*
Author: Kevin Kannammalil
Date: February 20, 2023
Purpose: GitHub Util Module, contains the utility functions for all GitHub related functionality that are used throughout the project
*/

import axios from "axios";
import { GitHubFile, GitHubFileContent, GitHubFiles } from "../data/GitHubData";
import { ProjectData } from "../data/ProjectData";

// Function that is used to create a new GitHub repository
async function createProject(project: ProjectData, accessToken: string): Promise<string> {
	try{
		await axios.post("https://api.github.com/user/repos", { 
			"name": project.projectName, 
			"private": project.isPrivate,
			"auto_init":true,
		}, { 
			headers: { 
				Authorization: `Bearer ${accessToken}`, 
				Accept: "application/vnd.github+json" 
			}
		});
	} catch (err) {
		throw err;
	}
	return "Successfully created repo";
}

// Function that is used to retrieve the list of collaborators for a GitHub repository
async function getRepoCollaborators(accessToken: string, project: ProjectData): Promise<ProjectData> {
	const collabs = [];

	await axios.get(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
	}).then((res) => {
		for (let j = 0; j < res.data.length; j++) {
			// Skip the owner of the repository
			if (res.data[j]["login"] == project.owner) {
				continue;
			}
			collabs.push(res.data[j]["login"]);
		} 
	}).catch((error) => {
		console.error(error);
		throw "Failed to get repository information";
	});

	project.collaborators = collabs;
	project.creationDate = new Date();

	return project;
}

// Function that is used to retrieve the list of files for a GitHub repository
async function getRepoContent(accessToken: string, project: ProjectData): Promise<GitHubFiles> {
	const files: GitHubFiles = await getFilesFromPath("", project, accessToken);
	return files;
}

// Function used to retrieve the list of files for a given path in a GitHub repository
async function getFilesFromPath(path: string, project: ProjectData, accessToken: string): Promise<GitHubFiles> {
	let imageFiles: GitHubFile[] = [];
	let texFiles: GitHubFile[] = [];
	const dirs = [];
	await axios.get(`https://api.github.com/repos/${project.owner}/${project.projectName}/contents/${path}`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
	}).then((res) => {
		for (let i = 0; i < res.data.length; i++) {
			const filename = res.data[i]["name"];
			// If the file is a directory, add it to the list of directories to be processed
			if (res.data[i]["type"] == "dir") {
				dirs.push(res.data[i]);
				continue;
			}
			const ext = filename.split(".").pop();
			if (ext === "tex" || ext === "bib" || ext === "jpg" || ext === "jpeg" || ext === "png") {
				const currFile: GitHubFile = { 
					name: res.data[i]["name"],
					path: res.data[i]["path"], 
					sha: res.data[i]["sha"], 
					url: res.data[i]["url"] 
				};

				if(ext === "tex" || ext === "bib"){
					texFiles.push(currFile);
				} else {
					imageFiles.push(currFile);
				}
			}
		}
	}).catch((error) => {
		console.error(error);
		throw "Error getting file from GitHub";
	});

	// Process the directories and add the corresponding files to the list of tex/image files
	for(let i = 0; i < dirs.length; i++) {
		const subFiles = await getFilesFromPath(dirs[i]["path"], project, accessToken);
		texFiles = texFiles.concat(subFiles.texFiles);
		imageFiles = imageFiles.concat(subFiles.imageFiles);
	}

	const files: GitHubFiles = {texFiles: texFiles, imageFiles: imageFiles};
	return files;
}

// Function used to retrieve the content from a GitHub blob
async function getContentFromBlob(accessToken: string, project: ProjectData, file: GitHubFile): Promise<GitHubFileContent> {
	const fileContent: GitHubFileContent = {content: "", encoding: ""};
	const file_sha = file.sha;
	const owner = project.owner;
	const repo = project.projectName;

	await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${file_sha}`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
	}).then((res) => {
		fileContent.content = res.data["content"],
		fileContent.encoding = res.data["encoding"];
	}).catch((error) => {
		console.error(error);
		throw "Error getting file from GitHub";
	});

	return fileContent;
}

// Function used to add collaborators to a GitHub repository
async function addCollabsToRepo(project: ProjectData, accessToken: string, usersToAdd: string[]): Promise<string> {
	const promises = [];

	usersToAdd.forEach((user) => {
		promises.push(axios.put(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators/${user}`, {}, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
		}));
	});

	try{
		await Promise.all(promises);
		return "Successfully added collaborators";
	} catch (err) {
		console.log(err);
		throw "Unable to add collaborators";
	}
}

// Function used to remove collaborators from a GitHub repository
async function removeCollabsFromRepo(project: ProjectData, accessToken: string, usersToRemove: string[]): Promise<string> {
	const promises = [];

	usersToRemove.forEach((user) => {
		promises.push(axios.delete(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators/${user}`, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
		}));
	});

	try{
		await Promise.all(promises);
		return "Successfully removed collaborators";
	} catch (err) {
		console.log(err);
		throw "Unable to add collaborators";
	}
}

const GitHubUtil = {
	createProject,
	getRepoCollaborators,
	getRepoContent,
	getContentFromBlob,
	addCollabsToRepo, 
	removeCollabsFromRepo
};

export { GitHubUtil };