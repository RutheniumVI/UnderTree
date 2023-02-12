import express, { Request, Response } from 'express';

import { AuthServices } from '../services/AuthServices.js';


async function authorizeJWT(req: Request, res: Response, next){
    let token = req.cookies["undertree-jwt"];
    let authResults = await AuthServices.validateUserAuth(token);
    if (authResults["validated"] == false) {
        console.log("unauthorized access, token: "+token);
        res.status(401).json("Unable to authorize user");
    } else {
        if (authResults["token"] != "") {
            console.log("Renewing cookie");
            token = authResults["token"];
            res.cookie("undertree-jwt", token, { httpOnly: true });
        }
        res.locals.token = token;
        next();
    }
}

const AuthUtil = {
    authorizeJWT
}

export { AuthUtil }