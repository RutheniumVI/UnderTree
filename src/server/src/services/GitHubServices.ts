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
router.route("/create-project").get(createProject);

let JWT_SECRET = process.env.JWT_SECRET;

async function getUserReposWithToken(token: string): Promise<Array<Object>> {
  let unfilteredRepos = [];
  let repos = [];
  let userProp = await AuthServices.getUserPropertyWithToken(token, "access_token");
  let accessToken = userProp["access_token"];
  console.log("User access token: ", accessToken);

  // /user/repos

  await axios.get("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
    params: { affiliation: "owner,collaborator" },
  })
  .then((res) => {
    // console.log(res.data);
    unfilteredRepos = res.data;
  })
  .catch((error) => {
    console.error(error);
    console.error(`Error getting user from GitHub`);
    return null;
  });

  for (let i = 0; i < unfilteredRepos.length; i++) {
    let currRepo = unfilteredRepos[i];
    let collabs = [];
    // await axios.get(`https://api.github.com/repos/${currRepo["owner"]["login"]}/${currRepo["name"]}/contributors`, {


    let repoDetails = { name: currRepo["name"], owner: currRepo["owner"]["login"] };
  }
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

      await getUserReposWithToken(token);

    } catch (err) {
      console.log("Token not valid");
      // res.sendStatus(403);
      // res.send({ ok: false, user: null });
    }
  
}

export { router };
