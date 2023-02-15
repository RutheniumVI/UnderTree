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
            res.cookie("undertree-jwt", token, { httpOnly: true, maxAge: 1000*60*60*24*365 });
		}

		const username = await AuthServices.getUserPropertyWithToken(token, "username");
		res.locals.token = token;
		res.locals.accessToken = await AuthServices.getUserPropertyWithToken(token, "access_token")
		res.locals.username = await AuthServices.getUserPropertyWithToken(token, "username");
		next();
	}
}

async function authorizeProjectAccess(req: Request, res: Response, next){
	let project = undefined;
	let owner = undefined;
	const username = res.locals.username

	if(req.method === "GET"){
		project = req.query.projectName;
		owner = req.query.owner;
	} else if (req.method === "POST") {
		project = req.body.projectName;
		owner = req.body.owner;
	}

	if(project === undefined || owner === undefined){
		res.status(401).json("Project information missing, for project authorization query");
	}

	if(!await ProjectDB.projectWithUserExists(project, owner, username)){
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