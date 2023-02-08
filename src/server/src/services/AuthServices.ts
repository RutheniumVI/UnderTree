import express, { Request, Response } from 'express';
const router = express.Router();
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { GitHubUser } from '../data/AuthData.js';
import { AuthDB } from '../database_interface/AuthDB.js';


dotenv.config();

router.use(cookieParser());
router.route("/github").get(getGitHubCode);
router.route("/getUser").get(getUser);
router.route("/logout").get(logout);

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

    let user = await axios
      .get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        return { 
          login: res.data.login, 
          name: res.data.name, 
          email: res.data.email, 
          access_token: accessToken 
        };
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

    if (gitHubUser == null) {
        throw new Error("No user found");
    }

    const token = jwt.sign({ username: gitHubUser.login }, JWT_SECRET)
    res.cookie("undertree-jwt", token, { httpOnly: true, domain: "localhost" });

    // For Production:
    // res.cookie("undertree-jwt", token, { httpOnly: true, secure: true });

    try{
      await AuthDB.addUser(gitHubUser, token);
    } catch (err) {
      // FIX THIS LATER
      console.log("User already logged in");
      // res.status(401).send({ ok: false, message: "User already is logged in" });
    }

    let result = await AuthDB.getUser(gitHubUser.login);
    console.log("DB Result: ", result);

    // await AuthDB.deleteUser(gitHubUser.login);

    res.redirect("http://localhost:3000?token=" + token);
}

async function getUser(req: Request, res: Response): Promise<void> {
    const token = req.cookies["undertree-jwt"];

    if (!token) {
      console.log("Token not found");
        // res.sendStatus(401);
        // res.send({ ok: false, user: null });
    } else {
      try{
        const decoded = jwt.verify(token, JWT_SECRET);
        res.send(decoded["username"]);
      } catch (err) {
        console.log("Token not valid");
        // res.sendStatus(403);
        // res.send({ ok: false, user: null });
      }
    }
}

async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies["undertree-jwt"];
  if (!token) {
    console.log("User already logged out");
      // res.sendStatus(401).send({ ok: false, user: null });
  } else {
    try{
      const decoded = jwt.verify(token, JWT_SECRET);
      await AuthDB.deleteUser(decoded["username"]);
      res.clearCookie("undertree-jwt");
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(401);
      // res.sendStatus(403).send({ ok: false, user: null });
    }
  }

  // res.end();
  // res.redirect('http://localhost:3000');
}
  

export { router }