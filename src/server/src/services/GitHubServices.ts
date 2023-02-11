import express from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthDB } from '../database_interface/AuthDB.js';
import { AuthServices } from './AuthServices.js';
import axios from "axios";

dotenv.config();

router.use(cookieParser());
router.route("/createProject").post(createProject);

let JWT_SECRET = process.env.JWT_SECRET;

async function getUserReposWithToken(token: string): Promise<Array<Object>> {
  let unfilteredRepos = [];
  let repos = [];
  let userProp = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let accessToken = userProp["access_token"];

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
    let name  = currRepo["name"];
    let owner = currRepo["owner"]["login"];
    let collabs = [];
    
    await axios.get(`https://api.github.com/repos/${owner}/${name}/collaborators`, {
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
    let repoDetails = { name: currRepo["name"], owner: currRepo["owner"]["login"], collaborators: collabs };
    repos.push(repoDetails);
  }
  console.log("Repos: ", repos);
  return repos;
}

async function createProject(req, res): Promise<void> {
  let token = req.cookies["undertree-jwt"];

  if (!token) {
    console.log("Token not found");
    return;
      // res.sendStatus(401);
      // res.send({ ok: false, user: null });
  } 
  try{
    let authResult = await AuthServices.validateUserAuth(token);
    if (authResult["validated"] == false) {
      console.log("Error creating project. User is not logged in");
      res.sendStatus(401);
      return;
    } 

    console.log("User is logged in");
    console.log("Creating project", authResult);
    if (authResult["token"] != "") {
      token = authResult["token"];
      res.cookie("undertree-jwt", authResult["token"], { httpOnly: true, domain: "localhost" });
    }        

    let userProp = await AuthServices.getUserPropertyWithToken(token, "access_token");
    let accessToken = userProp["access_token"];

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
  } catch (err) {
    console.log("Token not valid");
    // res.sendStatus(403);
    // res.send({ ok: false, user: null });
  }
  return;
}

async function deleteProject(token:string, name: string): Promise<void> {
  let userProp = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let accessToken = userProp["access_token"];

  userProp = await AuthServices.getUserPropertyWithToken(token, "username");
  let owner = userProp["username"];

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

const GitHubServices = {
  getUserReposWithToken,
  deleteProject,
}

export { router, GitHubServices };
