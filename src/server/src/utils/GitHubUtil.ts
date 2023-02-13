import axios from 'axios';
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

async function addCollabToRepo(token: string, repo: string, userToAdd: string): Promise<void> {
  let owner = await AuthServices.getUserPropertyWithToken(token, "username");  
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  await axios.put(`https://api.github.com/repos/${owner}/${repo}/collaborators/${userToAdd}`, {}, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    console.log(res.data);
    console.log("Successfully added collaborator");
  }).catch((error) => {
    console.error(error);
    console.error(`Error adding collaborator`);
  });
}

async function removeCollabFromRepo(token: string, repo: string, userToRemove: string): Promise<void> {
  let owner = await AuthServices.getUserPropertyWithToken(token, "username");
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  await axios.delete(`https://api.github.com/repos/${owner}/${repo}/collaborators/${userToRemove}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    console.log(res.data);
    console.log("Successfully removed collaborator");
  }).catch((error) => {
    console.error(error);
    console.error(`Error removing collaborator`);
  });
}

const GitHubUtil = {
  getListOfRepos,
  getRepoInfo,
  addCollabToRepo, 
  removeCollabFromRepo
}

export { GitHubUtil }