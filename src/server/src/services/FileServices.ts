import express from 'express';
import { FileUtil } from '../utils/FileUtil.js'
import { PersistenceUtil } from '../utils/PersistenceUtil.js'


const router = express.Router();

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);
router.route("/fileEdited").post(getPDF);

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
    res.contentType("application/pdf");
    res.send(fileData);
}

async function fileEdited(req, res) {
    
}

export { router };