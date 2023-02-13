import axios from 'axios';
import { AuthServices } from '../services/AuthServices.js';

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
  addCollabToRepo, 
  removeCollabFromRepo
}

export { GitHubUtil }