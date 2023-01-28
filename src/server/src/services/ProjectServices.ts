import express from 'express';

const router = express.Router();

router.route("/addProject").get(addProject);

function addProject(req, res): void {
    res.json("hello world!");
}

export { router };
