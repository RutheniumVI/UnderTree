import express, { Request, Response } from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthUtil } from '../utils/AuthUtil.js';
import { AuthServices } from './AuthServices.js';
import { GitHubUtil } from '../utils/GitHubUtil.js';
import axios from "axios";

dotenv.config();

router.use(cookieParser());
router.use(AuthUtil.authorizeJWT);
router.route("/createProject").post(createProject);
router.route("/commitFile").post(commitFile);
router.route("/addCollaborator").post(addCollaborator);
router.route("/removeCollaborator").post(removeCollaborator);

let JWT_SECRET = process.env.JWT_SECRET;

async function getUserReposWithToken(token: string): Promise<Array<Object>> {
  let unfilteredRepos = [];
  let repos = [];
  // let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  // await axios.get("https://api.github.com/user/repos", {
  //   headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
  //   params: { affiliation: "owner,collaborator" },
  // })
  // .then((res) => {
  //   unfilteredRepos = res.data;
  // })
  // .catch((error) => {
  //   console.error(error);
  //   console.error(`Error getting user from GitHub`);
  //   return null;
  // });

  unfilteredRepos = await GitHubUtil.getListOfRepos(token);

  for (let i = 0; i < unfilteredRepos.length; i++) {
    let currRepo = unfilteredRepos[i];
    let repo  = currRepo["name"];
    let owner = currRepo["owner"];
    let collabs = [];
    
    // await axios.get(`https://api.github.com/repos/${owner}/${repo}/collaborators`, {
    //   headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
    // }).then((res) => {
    //   for (let j = 0; j < res.data.length; j++) {
    //     if (res.data[j]["login"] == owner) {
    //       continue;
    //     }
    //     collabs.push(res.data[j]["login"]);
    //   } 
    // }).catch((error) => {
    //   console.error(error);
    //   console.error(`Error getting user from GitHub`);
    // });
    
    let repoDetails = await GitHubUtil.getRepoInfo(token, repo, owner);
    repos.push(repoDetails);
  }
  // console.log("Repos: ", repos);
  return repos;
}

async function createProject(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");

  let name = req.body.name;
  let desc = req.body.description;
  let homepage = req.body.homepage;
  let repoPrivate = req.body.repoPrivate;

  axios.post("https://api.github.com/user/repos", { 
      "name": name, 
      "description": desc,
      "homepage": homepage,
      "private": repoPrivate,
      "auto_init":true,
    }, { 
    headers: { 
      Authorization: `Bearer ${accessToken}`, 
      Accept: "application/vnd.github+json" 
    }
  }).then((res) => {
    console.log(res.data);
    console.log("Successfully created project");
  }).catch((error) => {
    console.error(error);
    console.error(`Error creating project`);
  });
  return;
}

async function deleteProject(token: string, name: string): Promise<void> {
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let owner = await AuthServices.getUserPropertyWithToken(token, "username");

  axios.delete(`https://api.github.com/repos/${owner}/${name}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    console.log(res.data);
    console.log("Successfully deleted project");
  }).catch((error) => {
    console.error(error);
    console.error(`Error deleting project`);
  });
}

async function commitFile(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];
  let repo = req.body.repo;
  let filepath = req.body.filepath;

  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let owner = await AuthServices.getUserPropertyWithToken(token, "username");

  let latestCommitSHA = "";
  let latestCommitURL = "";

  // Get reference to the Main branch
  await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
    }).then((res) => {
      console.log("Main Branch Data: ", res.data);
      latestCommitSHA = res.data["object"]["sha"];
      latestCommitURL = res.data["object"]["url"];
    }).catch((error) => {
      console.error(error);
      console.error(`Error getting branch reference from GitHub`);
    });

  let latestTreeSHA = "";
  let latestTreeURL = "";
  
  // Get the latest commit
  await axios.get(latestCommitURL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  }).then((res) => {
    console.log("Commit Data: ", res.data);
    // latestCommitSHA = res.data["sha"];
    latestTreeSHA = res.data["tree"]["sha"];
    latestTreeURL = res.data["tree"]["url"];
  }).catch((error) => {
    console.error(error);
    console.error(`Error getting latest commit from GitHub`);
  });

  let userBlobSHA = "";
  let userBlobURL = "";

  // Post the new file to GitHub blobs
  await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
    "content": "Hello World, this is UnderTree modifying a file!",
    "encoding": "utf-8"
  }, { 
    headers: { 
      Authorization: `Bearer ${accessToken}`, 
      Accept: "application/vnd.github+json" 
    }
  }).then((res) => {
    console.log("Blob Data: ", res.data);
    userBlobSHA = res.data["sha"];
    userBlobURL = res.data["url"];
  }).catch((error) => {
    console.error(error);
    console.error(`Error posting blob to GitHub`);
  });

  // Get the latest tree in GitHub
  await axios.get(latestTreeURL, { 
    headers: { 
      Authorization: `Bearer ${accessToken}`, 
      Accept: "application/vnd.github+json" 
    }
  }).then((res) => {
    console.log("Old Tree Data: ", res.data);
    // latestTreeSHA = res.data["sha"];
  }).catch((error) => {
    console.error(error);
    console.error(`Error getting latest tree from GitHub`);
  });

  let userTreeSHA = "";
  let userTreeURL = "";

  // Create a new tree with the new blob data
  await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    "base_tree": latestTreeSHA,
    "tree": [
      {
        "path": filepath,
        "mode": "100644",
        "type": "blob",
        "sha": userBlobSHA
      }
    ]
  }, {
    headers: { 
      Authorization: `Bearer ${accessToken}`, 
      Accept: "application/vnd.github+json" 
    } 
  }).then((res) => {
    console.log("New Tree Data: ", res.data);
    userTreeSHA = res.data["sha"];
    userTreeURL = res.data["url"];
  }).catch((error) => {
    console.error(error);
    console.error(`Error creating new tree with blob data`);
  });

  let userCommitSHA = "";
  let userCommitURL = "";

  // Create a new commit with the new tree data
  await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    "message": "Commit created by UnderTree!",
    "tree": userTreeSHA,
    "parents": [
      latestCommitSHA
    ]
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json"
    }
  }).then((res) => {
    console.log("New Commit Data: ", res.data);
    userCommitSHA = res.data["sha"];
    userCommitURL = res.data["url"];
  }).catch((error) => {
    console.error(error);
    console.error(`Error creating new commit with tree data`);
  });

  // Update the main branch with the new commit
  await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
    "sha": userCommitSHA
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json"
    }
  }).then((res) => {
    console.log("Updated Main Branch Data: ", res.data);
  }).catch((error) => {
    console.error(error);
    console.error(`Error updating main branch with new commit`);
  });
}

async function addCollaborator(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];
  let repo = req.body.repo;
  let userToAdd = req.body.userToAdd;

  await GitHubUtil.addCollabToRepo(token, repo, userToAdd); 
}

async function removeCollaborator(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];
  let repo = req.body.repo;
  let userToRemove = req.body.userToRemove;

  await GitHubUtil.removeCollabFromRepo(token, repo, userToRemove);
}


const GitHubServices = {
  getUserReposWithToken,
  deleteProject,
}

export { router, GitHubServices };
