import express, { Request, Response } from 'express';
const router = express.Router();
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

router.use(cookieParser());
router.route("/github").get(getGitHubCode);
router.route("/getUser").get(getUser);

let CLIENT_ID = process.env.GITHUB_CI;
let CLIENT_SECRET = process.env.GITHUB_CS;
let JWT_SECRET = process.env.JWT_SECRET;

export interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: null;
    blog: string;
    location: string;
    email: null;
    hireable: null;
    bio: null;
    twitter_username: null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: Date;
    updated_at: Date;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: {
        name: string;
        space: number;
        collaborators: number;
        private_repos: number;
    };
  }

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
    console.log(accessToken);

    let user = await axios
      .get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        return res.data;
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


    res.redirect("http://localhost:3000?token=" + token);
}

async function getUser(req: Request, res: Response): Promise<void> {
    const token = req.cookies["undertree-jwt"];
    console.log("Token: " + token);

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