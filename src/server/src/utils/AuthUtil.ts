import express, { Request, Response } from "express";

import { AuthServices } from "../services/AuthServices.js";
import { ProjectDB } from "../database_interface/ProjectDB.js";


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
			res.cookie("undertree-jwt", token, { httpOnly: true, domain: "localhost" });
		}

		const username = await AuthServices.getUserPropertyWithToken(token, "username");
		res.locals.token = token;
		res.locals.username = username;
		next();
	}
}

async function authorizeProjectAccess(req: Request, res: Response, next){
	const project = req.body.data.projectName;
	if(project === undefined){
		res.status(401).json("Project name field missing, for project authorization query");
	}

	if(!ProjectDB.projectWithUserExists(project, res.locals.username)){
		res.status(401).json("User not authorized to access the following project");
	} else {
		next();
	}
}

const AuthUtil = {
	authorizeJWT,
	authorizeProjectAccess
};

export { AuthUtil };