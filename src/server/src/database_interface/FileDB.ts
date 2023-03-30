import { DBClient } from "../utils/MongoDBUtil";
import { FileData, File } from "../data/FileData";
import { ProjectData } from "../data/ProjectData";

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

async function editFileCollaborator(owner: string, projectName: string, filePath: string, userName: string){
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.updateOne(
		{
			"projectName": projectName,
			"owner": owner,
			"files.filePath": filePath
		},
		{
			$addToSet: {'files.$.contributors': userName}
		}
	);
	

	if(result.modifiedCount != 1 && result.matchedCount == 0){
		throw "Failed updating collaborators";
	}

	return "Succesfully update contributors";

}

async function renameFile(project: ProjectData, file: File, newFileName: string, newFilePath: string, userName: string): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.updateOne(
		{
			"projectName": project.projectName,
			"owner": project.owner,
			"files.filePath": file.filePath
		},
		{
			$set: {
				'files.$.fileName': newFileName,
				'files.$.filePath': newFilePath
			},
			$addToSet: {'files.$.contributors': userName}
		}
	);

	if(result.modifiedCount != 1){
		throw "Failed changing fileName";
	}

	return "Succesfully changed fileName";
}


async function deleteFile(project: ProjectData, filePath: string, userName: string): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.update(
		{
			"projectName": project.projectName,
			"owner": project.owner,
		},
		{
			$pull: {
				"files": {"filePath": filePath}
			},
			$addToSet: {'deletedFiles': filePath}
		}
	);

	if(result.modifiedCount != 1){
		throw "Failed deleting fileName";
	}

	return "Succesfully deleting fileName";
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

async function getContributor(project: ProjectData, filePath: string) {
	const collection = DBClient.getCollection(collectionName);
	const result = await collection.findOne(
		{
			"projectName": project.projectName,
			"owner": project.owner,
			"files.filePath": filePath
		}
	);
	let contributor = [];
	result.files.forEach((ele) => {
		
		if(ele.filePath === filePath){
			console.log(ele);
			contributor = ele.contributors;
		}
	})
	return contributor;
}


const FileDB = {
	initializeProject,
	addProjectFile,
    deleteProjectFiles,
	editFileCollaborator,
	renameFile,
	getFiles,
	deleteFile,
	getContributor
};

export { FileDB };