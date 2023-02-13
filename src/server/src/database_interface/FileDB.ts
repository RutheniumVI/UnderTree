import { DBClient } from "../utils/MongoDBUtil.js";
import { FileData, File } from "../data/FileData.js";
import { ProjectData } from "../data/ProjectData.js";

const collectionName = "files";

async function initializeProjectFiles(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({"projectName": project.projectName, "owner": project.owner});

	if(existingProject !== null){
		throw "File system corresponding to the project already exists in the database";
	}
	try{
        const filePath = project.owner+"/"+project.projectName+"/main.tex";
        const mainFile: File = {fileName: "main.tex", fileType: "tex", filePath: filePath, documentID: filePath}
        const fileData: FileData = {projectName: project.projectName, owner: project.owner, files: [mainFile]}
		await collection.insertOne(fileData);
	}
	catch (err) {
		console.log(err);
		throw "Failed to add project file system to database";
	}

	return "Succesfully added project file system";
}

async function deleteProjectFiles(project: ProjectData): Promise<string> {
	const collection = DBClient.getCollection(collectionName);

	const result = await collection.deleteOne({"projectName": project.projectName, "owner": project.owner});

	if(result.deletedCount != 1){
		throw "File system corresponding to the project has already been deleted";
	}

	return "Succesfully deleted project file system";
}

const FileDB = {
	initializeProjectFiles,
    deleteProjectFiles
};

export { FileDB };