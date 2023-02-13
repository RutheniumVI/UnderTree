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

async function getRepoInfo(token: string, repo: string, owner: string): Promise<Object> {
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

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
  addCollabsToRepo, 
  removeCollabsFromRepo
}

export { GitHubUtil }