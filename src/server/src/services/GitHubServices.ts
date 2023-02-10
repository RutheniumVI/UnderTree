import express from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

router.use(cookieParser());
router.route("/create-project").get(createProject);

let JWT_SECRET = process.env.JWT_SECRET;

function createProject(req, res): void {
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

export { router };
