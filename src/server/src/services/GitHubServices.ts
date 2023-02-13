import express, { Request, Response } from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthUtil } from '../utils/AuthUtil.js';
import { AuthServices } from './AuthServices.js';
import { GitHubUtil } from '../utils/GitHubUtil.js';
import axios from "axios";
import { ProjectData } from '../data/ProjectData.js';
import { ProjectDB } from '../database_interface/ProjectDB.js';

dotenv.config();

router.use(cookieParser());
router.use(AuthUtil.authorizeJWT);

router.route("/repositoryExists").get(repositoryExists);
router.route("/userExists").get(userExists);
router.route("/commitFiles").post(commitFiles);

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
    
    let repoDetails = await GitHubUtil.getRepoInfo(token, repo);
    repos.push(repoDetails);
  }
  // console.log("Repos: ", repos);
  return repos;
}

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

async function deleteProject(token: string, name: string): Promise<void> {
  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let owner = await AuthServices.getUserPropertyWithToken(token, "username");

  // axios.delete(`https://api.github.com/repos/${owner}/${name}`, {
  //   headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
  // }).then((res) => {
  //   console.log(res.data);
  //   console.log("Successfully deleted project");
  // }).catch((error) => {
  //   console.error(error);
  //   console.error(`Error deleting project`);
  // });
}

async function repositoryExists(req: Request, res: Response): Promise<void> {
	const accessToken = await AuthServices.getUserPropertyWithToken(res.locals.token, "access_token");
	const owner = req.query.owner;
	const name = req.query.name;
	try{
		await axios.get(`https://api.github.com/repos/${owner}/${name}`, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		})
		res.json(true);
	} catch {
		res.json(false);
	}
}

async function userExists(req: Request, res: Response): Promise<void> {
	const accessToken = await AuthServices.getUserPropertyWithToken(res.locals.token, "access_token");
	const name = req.query.name;
	try{
		await axios.get(`https://api.github.com/users/${name}`, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		})
		res.json(true);
	} catch {
		res.json(false);
	}
}

async function commitFiles(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];
  let repo = req.body.repo;
  let files = req.body.files;
  let fileBlobs = [];

  let accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");  
  let user = await AuthServices.getUserPropertyWithToken(token, "username");

  let repoInfo = await GitHubUtil.getRepoInfo(token, repo);
  let owner = repoInfo["owner"];

  console.log("User: " + user + " Owner: " + owner);
  if (user != owner && !repoInfo["collaborators"].includes(user)) {
    res.status(401).json("Unauthorized to commit to this repository");
    return;
  }

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

  for(let i = 0; i < files.length; i++) {
    let currFile = files[i];

    // Post the new file to GitHub blobs
    await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      "content": currFile.content,
      "encoding": "utf-8"
    }, { 
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        Accept: "application/vnd.github+json" 
      }
    }).then((res) => {
      console.log("Blob Data: ", res.data);
      fileBlobs.push({ 
        "path": currFile.filepath,
        "mode": "100644",
        "type": "blob", 
        "sha": res.data["sha"]
      })
    }).catch((error) => {
      console.error(error);
      console.error(`Error posting blob to GitHub`);
    });
  }

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
    "tree": fileBlobs
    // "tree": [
    //   {
    //     "path": fileTest.filepath,
    //     "mode": "100644",
    //     "type": "blob",
    //     "sha": userBlobSHA
    //   }
    // ]
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


  // make logic to check if userCommitSHA exists in the project data, 
  // if so, use that as the parent instead of the latest commit SHA
  let currProject = await ProjectDB.getProject(repo, owner);

  let commitParent = latestCommitSHA;
  if (currProject.commit.current.sha) {
    commitParent = currProject.commit.current.sha;
  }

  // Create a new commit with the new tree data
  await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    "message": "Commit created by UnderTree!",
    "tree": userTreeSHA,
    "parents": [
      commitParent
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

  currProject.commit.current.sha = userCommitSHA;
  currProject.commit.current.url = userCommitURL;
  currProject.commit.remote.sha = latestCommitSHA;
  currProject.commit.remote.url = latestCommitURL;

  // PUSH: Update the main branch with the new commit
  await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
    "sha": userCommitSHA,
    "force": true
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

  currProject.commit.current.sha = null;
  currProject.commit.current.url = null;
}

const GitHubServices = {
  getUserReposWithToken,
  createProject,
  deleteProject,
}

export { router, GitHubServices };
