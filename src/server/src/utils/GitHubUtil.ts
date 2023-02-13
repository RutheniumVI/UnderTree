import axios from 'axios';
import { ProjectData } from '../data/ProjectData.js';
import { AuthServices } from '../services/AuthServices.js';

async function getListOfRepos(token: string): Promise<Array<Object>> {
  let unfilteredRepos = [];
  let repos = [];
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  await axios.get("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
    params: { affiliation: "owner,collaborator" },
  })
  .then((res) => {
    unfilteredRepos = res.data;
  })
  .catch((error) => {
    console.error(error);
    console.error(`Error getting user from GitHub`);
    return null;
  });

  for (let i = 0; i < unfilteredRepos.length; i++) {
    let currRepo = unfilteredRepos[i];
    
    let repoDetails = { name: currRepo["name"], owner: currRepo["owner"]["login"] };
    repos.push(repoDetails);
  }
  // console.log("Repos: ", repos);
  return repos;
}

async function getRepoInfo(token: string, repo: string): Promise<Object> {
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  let owner = ""
  let userRepos = await getListOfRepos(token);
  for (let i = 0; i < userRepos.length; i++) {
    if (userRepos[i]["name"] == repo) {
      owner = userRepos[i]["owner"];
      break;
    }
  }
  if (owner == "") {
    console.error(`Error: User doesn't have access to ${repo}`);
    return null;
  }

  let collabs = [];
    
  await axios.get(`https://api.github.com/repos/${owner}/${repo}/collaborators`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    for (let j = 0; j < res.data.length; j++) {
      if (res.data[j]["login"] == owner) {
        continue;
      }
      collabs.push(res.data[j]["login"]);
    } 
  }).catch((error) => {
    console.error(error);
    console.error(`Error getting user from GitHub`);
  });
  
  let repoInfo = { name: repo, owner: owner, collaborators: collabs };

  return repoInfo;
}

async function getRepoContent(token: string, repo: string): Promise<Array<Object>> {
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let owner = ""
  let userRepos = await getListOfRepos(token);
  for (let i = 0; i < userRepos.length; i++) {
    if (userRepos[i]["name"] == repo) {
      owner = userRepos[i]["owner"];
      break;
    }
  }
  if (owner == "") {
    console.error(`Error: User doesn't have access to ${repo}`);
    return null;
  }
  
  let files = await getFilesFromPath("", owner, repo, accessToken);
  return files;
}

async function getFilesFromPath(path: string, owner: string, repo: string, accessToken: string): Promise<Array<Object>> {
  let files = []
  let dirs = []
  await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      let filename = res.data[i]["name"];
      let currFile = {}
      if (res.data[i]["type"] == "dir") {
        dirs.push(res.data[i]);
        continue;
      }
      let ext = filename.split('.').pop();
      if (ext == "tex" || ext == "jpg" || ext == "jpeg" || ext == "png") {
        currFile = { 
          name: res.data[i]["name"],
          path: res.data[i]["path"], 
          sha: res.data[i]["sha"], 
          url: res.data[i]["url"] 
        };
        files.push(currFile);
      }
    }
  }).catch((error) => {
    console.error(error);
    console.error(`Error getting file from GitHub`);
  });

  for(let i = 0; i < dirs.length; i++) {
    let subFiles = await getFilesFromPath(dirs[i]["path"], owner, repo, accessToken);
    files = files.concat(subFiles);
  }
  return files;
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
  getListOfRepos,
  getRepoInfo,
  getRepoContent,
  addCollabsToRepo, 
  removeCollabsFromRepo
}

export { GitHubUtil }