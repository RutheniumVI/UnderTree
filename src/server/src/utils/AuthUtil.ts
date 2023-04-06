/*
Author: Kevin Kannammalil
Date: February 16, 2023
Purpose: Auth Util Module, contains the utility functions for all Auth related functionality that are used throughout the project
*/

import { Request, Response } from "express";

import { AuthServices } from "../services/AuthServices";
import { ProjectDB } from "../database_interface/ProjectDB";

// Middleware function that is used to authorize a user's JWT token
async function authorizeJWT(req: Request, res: Response, next){
	let token = req.cookies["undertree-jwt"];
	const authResults = await AuthServices.validateUserAuth(token);
	if (authResults["validated"] == false) {
		console.log("unauthorized access, token: "+token);
		res.status(401).json("Unable to authorize user");
	} else {
		if (authResults["token"] != "") {
			console.log("Renewing cookie");
			token = authResults["token"];
			res.cookie("undertree-jwt", token, { httpOnly: true, maxAge: 1000*60*60*24*365 });
		}
		
		// Set the token, access token, and username as local variables for the rest of the request
		res.locals.token = token;
		res.locals.accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token");
		res.locals.username = await AuthServices.getUserPropertyWithToken(token, "username");
		next();
	}
}

// Function that is used to determine if a user is authorized to access a project
async function authorizeProjectAccess(req: Request, res: Response, next){
	let project = undefined;
	let owner = undefined;
	const username = res.locals.username;

	// Retrieve the required information from the request depending on the request method
	if(req.method === "GET"){
		project = req.query.projectName;
		owner = req.query.owner;
	} else if (req.method === "POST") {
		project = req.body.projectName;
		owner = req.body.owner;
	}

	if(project === undefined || owner === undefined){
		res.status(401).json("Project information missing, for project authorization query");
	} else {

		if(!await ProjectDB.projectWithUserExists(project, owner, username)){
			res.status(401).json("User not authorized to access the following project");
		} else {
			next();
		}
	}
}

const AuthUtil = {
	authorizeJWT,
	authorizeProjectAccess
};

export { AuthUtil };