import axios from 'axios';
import { ProjectData } from '../data/ProjectData.js';
import { AuthServices } from '../services/AuthServices.js';

async function addCollabsToRepo(project: ProjectData, accessToken: string, usersToAdd: string[]): Promise<string> {
  let promises = [];

  usersToAdd.forEach((user) => {
    promises.push(axios.put(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators/${user}`, {}, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
    }));
  })

  try{
    await Promise.all(promises);
    return "Successfully added collaborators";
  } catch (err) {
    console.log(err);
    throw "Unable to add collaborators"
  }
}

async function removeCollabsFromRepo(project: ProjectData, accessToken: string, usersToRemove: string[]): Promise<string> {
  let promises = [];

  usersToRemove.forEach((user) => {
    promises.push(axios.delete(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators/${user}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
    }));
  })

  try{
    await Promise.all(promises);
    return "Successfully added collaborators";
  } catch (err) {
    console.log(err);
    throw "Unable to add collaborators"
  }
}

const GitHubUtil = {
  addCollabsToRepo, 
  removeCollabsFromRepo
}

export { GitHubUtil }