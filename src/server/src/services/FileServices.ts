import express from 'express';

import { AuthUtil } from '../utils/AuthUtil.js';
import { FileUtil } from '../utils/FileUtil.js'
import { PersistenceUtil } from '../utils/PersistenceUtil.js'

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
router.use(AuthUtil.authorizeProjectAccess);

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);
router.route("/fileEdited").post(fileEdited);

async function compilePDF(req, res){
    try {
        await FileUtil.createPDFOutput("output.tex", req.body.text)
        const fileData = FileUtil.getFileData("output.pdf");
        res.json("Successfully compiled PDF");
    }
    catch (err) {
        res.json(err);
    }
}

async function getPDF(req, res) {
    const fileData = FileUtil.getFileData(req.query.file+".pdf");
    res.set('content-type', "application/pdf");
    res.send(fileData);
}

async function fileEdited(req, res) {
    const editorName = req.body.username;
    console.log(req.body);
}

export { router };