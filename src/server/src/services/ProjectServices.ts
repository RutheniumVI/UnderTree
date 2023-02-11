import express from 'express';
import { AuthServices } from './AuthServices.js';

const router = express.Router();

router.route("/addProject").get(addProject);

async function addProject(req, res): Promise<void> {
    console.log(req.cookies["undertree-jwt"]);
    let authResults = await AuthServices.validateUserAuth(req.cookies["undertree-jwt"]);
    if (authResults["validated"] == false) {
        console.log("Error creating project. User is not logged in");
    } else if (authResults["token"] != "") {
        res.cookie("undertree-jwt", authResults["token"], { httpOnly: true, domain: "localhost" });
    }

    console.log(authResults);
    res.json("hello world!");
}

export { router };
