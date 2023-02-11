import express from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthDB } from '../database_interface/AuthDB.js';
import { AuthServices } from './AuthServices.js';

dotenv.config();

router.use(cookieParser());
router.route("/create-project").get(createProject);

let JWT_SECRET = process.env.JWT_SECRET;

async function createProject(req, res): Promise<void> {
  const token = req.cookies["undertree-jwt"];

  if (!token) {
    console.log("Token not found");

      // res.sendStatus(401);
      // res.send({ ok: false, user: null });
  } else {
    try{
      let authResult = await AuthServices.validateUserAuth(token);
      if (authResult["validated"] == false) {
        console.log("Error creating project. User is not logged in");
        res.sendStatus(401);
      } else {
        console.log("User is logged in");
        console.log("Creating project", authResult);
        if (authResult["token"] != "") {
          res.cookie("undertree-jwt", authResult["token"], { httpOnly: true, domain: "localhost" });
        }        
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      res.send(decoded["username"]);
    } catch (err) {
      console.log("Token not valid");
      // res.sendStatus(403);
      // res.send({ ok: false, user: null });
    }
  }
}

export { router };
