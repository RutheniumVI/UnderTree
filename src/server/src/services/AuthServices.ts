/*
Author: Kevin Kannammalil
Date: March 16, 2023
Purpose: Auth Service Module, responsible for handling all logic associated with authorization that is transmitted from the frontend.
*/

import express, { Request, Response } from "express";
const router = express.Router();
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { GitHubUser, MongoUser } from "../data/AuthData";
import { AuthDB } from "../database_interface/AuthDB";


dotenv.config();

// Set up routes for the api calls that the frontend can use to communicate with each function
router.route("/github").get(getGitHubCode);
router.route("/getUsername").get(getUsername);
router.route("/logout").get(logout);

const CLIENT_ID = process.env.GITHUB_CI;
const CLIENT_SECRET = process.env.GITHUB_CS;
const JWT_SECRET = process.env.JWT_SECRET;

// Check if a user's token is valid to see if they really are who they say they are
async function validateUserAuth(token: string): Promise<Object> {
	let newToken = "";
	try{
		const user = await AuthDB.getUserWithToken(token);
		if (user == null) {
			console.log("User is not retrievable with this token: ", token);
			return { validated: false, token: newToken };
		}
		if (user.jwt == null || user.jwt == "" || user.jwt != token) {
			console.log("User's jwt token doesn't match token: ", token, user.jwt);
			return { validated: false, token: newToken };
		}

    // If the token is expired, renew it
		jwt.verify(token, JWT_SECRET, async (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					console.log("Token expired");
					newToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "7d" });
					await AuthDB.updateUserWithToken(token, newToken);    
					console.log("Renewing token: ", token, newToken);

				}
			}
		});

		return { validated: true, token: newToken };
	} catch (err) {
		return { validated: false, token: newToken };
	}
}

// Get a specific property of user data given their token
async function getUserPropertyWithToken(token: string, property: keyof MongoUser): Promise<any> {
	const user = await AuthDB.getUserWithToken(token);
	if (user == null || user[property] == null) {
		console.log("User Property not found with token");
		return null;
	}
	return user[property];
}

// Helper function to retrieve the user from GitHub and store it in our model of a GitHub user
async function getGitHubUser({ code }: { code: string }): Promise<GitHubUser> {
	const githubToken = await axios
		.post(
			`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`, { 
				headers: { 
					"X-OAuth-Scopes": "user, repo, admin:org", 
					"X-Accepted-OAuth-Scopes": "user"
				} 
			})
		.then((res) => res.data)
  
		.catch((error) => {
			throw error;
		});
  
  // Extract the access token from the response
	const decoded = querystring.parse(githubToken);
	const accessToken = decoded.access_token;

	const user = await axios
		.get("https://api.github.com/user", {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then(async (res) => {

      // If the user doesn't have an email, get it from the GitHub Emails API
			if (res.data.email == null) {
				console.log("No email found for user, getting email from GitHub Emails API");
				const userEmail = await axios.get("https://api.github.com/user/emails", {
					headers: { Authorization: `Bearer ${accessToken}` },
				}).then((res) => {
					console.log("Emails: ", res.data[0].email);
					return res.data[0].email;
				})
					.catch((error) => {
						console.error("Error getting user email from GitHub");
						return null;
					});

				if (userEmail == null) {
					console.error("No email found for user");
					return null;
				}
				res.data.email = userEmail;
			}

      // Returns the required user information for the GitHubUser model
			return { 
				login: res.data.login, 
				name: res.data.name, 
				email: res.data.email, 
				access_token: accessToken, 
				avatar_url: res.data.avatar_url
			};
		})
		.catch((error) => {
			console.error("Error getting user from GitHub");
			return null;
		});

	return user;
}

// Function that handles the GitHub OAuth callback
async function getGitHubCode(req: Request, res: Response): Promise<void> {
	const code = req.query.code as string;

	if (!code) {
		throw "No code provided";
	}
    
	const gitHubUser = await getGitHubUser({ code });

	if (gitHubUser == null) {
		throw "No user found";
	}

  // Create a JWT token for the user and store it in a cookie in the browser
	const token = jwt.sign({ username: gitHubUser.login }, JWT_SECRET, { expiresIn: "7d" });
	res.cookie("undertree-jwt", token, { httpOnly: true, maxAge: 1000*60*60*24*365 });

	try{
		await AuthDB.addUser(gitHubUser, token);
	} catch (err) {
		console.log("User already logged in");
	}

	const result = await AuthDB.getUserWithToken(token);
	console.log("User logged in: ", result);
    
	res.redirect(process.env.FULL_DOMAIN_URL);
}

// Function to retrieve the username of the user given their token
async function getUsername(req: Request, res: Response): Promise<void> {
	const token = req.cookies["undertree-jwt"];

	if (!token) {
		console.log("Token not found when trying to get username");
	} else {
		try{
			const authResult = await validateUserAuth(token);
			let decoded;

			if (authResult["token"] != "") {
				console.log("Renewing Cookie");
				res.cookie("undertree-jwt", token, { httpOnly: true, maxAge: 1000*60*60*24*365 });
				decoded = jwt.verify(authResult["token"], JWT_SECRET);
			} else {
				decoded = jwt.verify(token, JWT_SECRET);
			}
        
			res.send(decoded["username"]);
		} catch (err) {
			console.log(err);
			console.log("Token not valid when trying to get username");
		}
	}
}

// Function to log out the user given their token
async function logout(req: Request, res: Response): Promise<void> {
	const token = req.cookies["undertree-jwt"];
	if (!token) {
		console.log("User already logged out");
	} else {
		try{
			await AuthDB.deleteUserWithToken(token);
			res.clearCookie("undertree-jwt");
			res.sendStatus(200);
		} catch (err) {
			console.log(err);
			res.sendStatus(401);
		}
	}
}

const AuthServices = {
	validateUserAuth, getUserPropertyWithToken
};

export { router, AuthServices };
