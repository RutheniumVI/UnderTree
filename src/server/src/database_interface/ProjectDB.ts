import { DBClient } from "../utils/MongoDBUtil.js";
import { ProjectData } from "../data/ProjectData.js";

const collectionName = "projects";

async function projectWithUserExists(projectName: string, userName: string): Promise<boolean> {
	const collection = DBClient.getCollection(collectionName);
	const existingProject = await collection.findOne({
		$and: [
			{"projectName": projectName}, 
			{ 
				$or: [
					{
						"owner": userName
					},
					{
						"collaborators": userName
					},
				]
			}
		]
	});

	if(existingProject !== null){
		return false;
	} else {
		return true;
	}
}

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

async function getProjects(userName: string): Promise<ProjectData[]> {
	const projects: ProjectData[] = [];

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
	getProjects,
	editProject,
	deleteProject
};

export { ProjectDB };