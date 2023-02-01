import { DBClient } from '../utils/MongoDBUtil.js';
import { ProjectData } from '../data/ProjectData.js';

const collectionName = "projects";

async function addProject(project: ProjectData): Promise<string> {
    const collection = DBClient.getCollection(collectionName);
    const existingProject = await collection.findOne({"name": project.name})

    if(existingProject !== null){
        return "Project with the following name already exists in the database";
    }
    else {
        try{
            const insert = await collection.insertOne(project);
        }
        catch (err) {
            console.log(err);
            return "Failed to add project to database";
        }
    }

    return "Succesfully added project";
}

const ProjectDB = {
    addProject
}

export { ProjectDB }