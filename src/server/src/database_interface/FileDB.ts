import { DBClient } from "../utils/MongoDBUtil.js";
import { FileData, File } from "../data/FileData.js";
import { ProjectData } from "../data/ProjectData.js";

const collectionName = "files";

async function initializeProject(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject !== null){
		throw "File system corresponding to the project already exists in the database";
	}
	try{
        const fileData: FileData = {projectName: project.projectName, owner: project.owner, files: [], deletedFiles: []};
		await collection.insertOne(fileData);
	}
	catch (err) {
		console.log(err);
		throw "Failed to add project file system to database";
	}

	return "Succesfully added project file system";
}

async function addProjectFile(project: ProjectData, file: File): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject === null){
		throw "File system corresponding to the project does not exist in the database";
	}
	try{
        await collection.updateOne({"projectName": project.projectName, "owner": project.owner},
			{
				$push: {files: file}
			}
		);
	}
	catch (err) {
		console.log(err);
		throw "Failed to add file to project";
	}

	return "Succesfully added file to project";
}

async function deleteProjectFiles(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.deleteOne({"projectName": project.projectName, "owner": project.owner});

	if(result.deletedCount != 1){
		throw "File system corresponding to the project has already been deleted";
	}

	return "Succesfully deleted project file system";
}

async function editFileCollaborator(owner: string, projectName: string, fileName: string, userName: string){
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.updateOne(
		{
			"projectName": projectName,
			"owner": owner,
			"files.fileName": fileName
		},
		{
			$addToSet: {'files.$.contributors': userName}
		}
	);

	if(result.modifiedCount != 1){
		throw "Failed updating collaborators";
	}

	return "Succesfully update contributors";

}

async function renameFile(project: ProjectData, file: File, newFileName: string, userName: string): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.updateOne(
		{
			"projectName": project.projectName,
			"owner": project.owner,
			"files.fileName": file.fileName
		},
		{
			$set: {'files.$.fileName': newFileName},
			$addToSet: {'files.$.contributors': userName}
		}
	);

	if(result.modifiedCount != 1){
		throw "Failed changing fileName";
	}

	return "Succesfully changed fileName";
}

async function getFiles(project: ProjectData): Promise<File[]> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.findOne(
		{
			"projectName": project.projectName,
			"owner": project.owner
		},
	);

	if(!result){
		throw "Failed fetching files";
	}

	return result.files as File[];
}


const FileDB = {
	initializeProject,
	addProjectFile,
    deleteProjectFiles,
	editFileCollaborator,
	renameFile,
	getFiles
};

export { FileDB };