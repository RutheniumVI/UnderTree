import axios from 'axios';
import { GitHubFile, GitHubFileContent, GitHubFiles } from '../data/GitHubData.js';
import { ProjectData } from '../data/ProjectData.js';
import { AuthServices } from '../services/AuthServices.js';

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
  return "Successfully created repo"
}

async function getRepoCollaborators(accessToken: string, project: ProjectData): Promise<ProjectData> {
  let collabs = [];

  await axios.get(`https://api.github.com/repos/${project.owner}/${project.projectName}/collaborators`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    for (let j = 0; j < res.data.length; j++) {
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

async function getRepoContent(accessToken: string, project: ProjectData): Promise<GitHubFiles> {
  let files: GitHubFiles = await getFilesFromPath("", project, accessToken);
  return files;
}

async function getFilesFromPath(path: string, project: ProjectData, accessToken: string): Promise<GitHubFiles> {
  let imageFiles: GitHubFile[] = []
  let texFiles: GitHubFile[] = []
  let dirs = []
  await axios.get(`https://api.github.com/repos/${project.owner}/${project.projectName}/contents/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      let filename = res.data[i]["name"];
      if (res.data[i]["type"] == "dir") {
        dirs.push(res.data[i]);
        continue;
      }
      const ext = filename.split('.').pop();
      if (ext === "tex" || ext === "jpg" || ext === "jpeg" || ext === "png") {
        const currFile: GitHubFile = { 
          name: res.data[i]["name"],
          path: res.data[i]["path"], 
          sha: res.data[i]["sha"], 
          url: res.data[i]["url"] 
        };

        if(ext === "tex"){
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

  for(let i = 0; i < dirs.length; i++) {
    const subFiles = await getFilesFromPath(dirs[i]["path"], project, accessToken);
    texFiles = texFiles.concat(subFiles.texFiles);
    imageFiles = imageFiles.concat(subFiles.imageFiles);
  }

  const files: GitHubFiles = {texFiles: texFiles, imageFiles: imageFiles}
  return files;
}

async function getContentFromBlob(accessToken: string, project: ProjectData, file: GitHubFile): Promise<GitHubFileContent> {
  let fileContent: GitHubFileContent = {content: "", encoding: ""};
  let file_sha = file.sha;
  let owner = project.owner;
  let repo = project.projectName;

  await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${file_sha}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    fileContent.content = res.data["content"],
    fileContent.encoding = res.data["encoding"]
  }).catch((error) => {
    console.error(error);
    throw "Error getting file from GitHub"
  });

  return fileContent;
}

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
    return "Successfully removed collaborators";
  } catch (err) {
    console.log(err);
    throw "Unable to add collaborators"
  }
}

const GitHubUtil = {
  createProject,
  getRepoCollaborators,
  getRepoContent,
  getContentFromBlob,
  addCollabsToRepo, 
  removeCollabsFromRepo
}

export { GitHubUtil }