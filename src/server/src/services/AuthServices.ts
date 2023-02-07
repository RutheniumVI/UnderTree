import express, { Request, Response } from 'express';
const router = express.Router();
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { GitHubUser } from '../data/AuthData.js';

import { DBClient } from '../utils/MongoDBUtil.js';
import { AuthDB } from '../database_interface/AuthDB.js';


dotenv.config();

router.use(cookieParser());
router.route("/github").get(getGitHubCode);
router.route("/getUser").get(getUser);

let CLIENT_ID = process.env.GITHUB_CI;
let CLIENT_SECRET = process.env.GITHUB_CS;
let JWT_SECRET = process.env.JWT_SECRET;


async function getGitHubUser({ code }: { code: string }): Promise<GitHubUser> {
    const githubToken = await axios
      .post(
        `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`
      )
      .then((res) => res.data)
  
      .catch((error) => {
        throw error;
      });
  
    const decoded = querystring.parse(githubToken);
    const accessToken = decoded.access_token;
    // console.log(accessToken);

    let user = await axios
      .get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {

        return { 
          login: res.data.login, 
          // id: res.data.id, 
          name: res.data.name, 
          email: res.data.email, 
          access_token: accessToken 
        };
        // res.data
        })
      .catch((error) => {
        console.error(`Error getting user from GitHub`);
        return null;
      });

      return user;
  }

async function getGitHubCode(req: Request, res: Response): Promise<void> {
    let code = req.query.code as string;

    if (!code) {
         throw new Error("No code provided");
    }
    
    const gitHubUser = await getGitHubUser({ code });
    console.log(gitHubUser);

    if (gitHubUser == null) {
        throw new Error("No user found");
    }

    const token = jwt.sign({ username: gitHubUser.login }, JWT_SECRET)

    res.cookie("undertree-jwt", token, { httpOnly: true, domain: "localhost" });
    // For Production:
    // res.cookie("undertree-jwt", token, { httpOnly: true, secure: true });

    // await AuthDB.addUser(gitHubUser, token);

    let response = await DBClient.collectionExists("users");
    if (!response) {
      await DBClient.createCollection("users");
      await DBClient.getCollection("users").createIndex({ username: 1 }, { unique: true });
    }

    await DBClient.getCollection("users").insertOne({
        username: gitHubUser.login,
        jwt: token,
        access_token: gitHubUser.access_token,
        name: gitHubUser.name,
        email: gitHubUser.email,
        // id: gitHubUser.id,
    });

    await DBClient.getCollection("users").findOne({ username: gitHubUser.login }, (err, result) => {
      if (err) throw err;
      console.log(result);
    });


    // const delResult = await DBClient.getCollection("users").deleteMany({ username: gitHubUser.login });
    // if (delResult.deletedCount > 0) { 
    //   console.log("Deleted user: " + gitHubUser.login);
    // } else {
    //   console.log("No user to delete");
    // }
    // await DBClient.getCollection("users").drop((err, delOK) => {
    //   if (err) throw err;
    //   if (delOK) console.log("Collection deleted");
    // });

    // const docCount = await DBClient.getCollection("users").countDocuments({ username: gitHubUser.login });
    // console.log("docCount: " + docCount);

    // await AuthDB.deleteUser(gitHubUser.login);

    // let result = await AuthDB.getUser(gitHubUser.login);
    // console.log("DB Result: " + result);

    res.redirect("http://localhost:3000?token=" + token);
}

async function getUser(req: Request, res: Response): Promise<void> {
    const token = req.cookies["undertree-jwt"];
    // console.log("Token: " + token);

    if (!token) {
        res.sendStatus(401);
        res.send({ ok: false, user: null });
    }
    try{
      const decode = jwt.verify(token, JWT_SECRET);
      res.send(decode["username"]);
    } catch (err) {
      console.log(err);
      res.sendStatus(403);
      res.send({ ok: false, user: null });
    }
}

export { router }