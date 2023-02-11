import express from 'express';
import { AuthServices } from './AuthServices.js';

const router = express.Router();

router.route("/addProject").get(addProject);

async function addProject(req, res): Promise<void> {
    let token = req.cookies["undertree-jwt"];
    let authResults = await AuthServices.validateUserAuth(token);
    if (authResults["validated"] == false) {
        console.log("Error creating project. User is not logged in");
    } else if (authResults["token"] != "") {
        console.log("Renewing cookie");
        res.cookie("undertree-jwt", authResults["token"], { httpOnly: true, domain: "localhost" });
    }

    let avatar_url = await AuthServices.getUserPropertyWithToken(token, "avatar_url");
    if (avatar_url["avatar_url"] != null) {
        console.log("Avatar: ", avatar_url["avatar_url"]);
    } else {
        console.log("Error getting avatar url");    
    }
    res.json("hello world!");
}

export { router };
