import express from 'express';
import { FileDB } from '../database_interface/FileDB.js';
import { ProjectData } from '../data/ProjectData.js';
import { File } from '../data/FileData.js';

import { AuthUtil } from '../utils/AuthUtil.js';
import { FileUtil } from '../utils/FileUtil.js';
import { PersistenceUtil } from '../utils/PersistenceUtil.js';

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
router.use(AuthUtil.authorizeProjectAccess);

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);
router.route("/addFile").post(addFile);
router.route("/renameFile").post(renameFile);
router.route("/getFiles").post(getFiles);
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

async function addFile(req, res){
    const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName}

    const fileName = req.body.fileName;
    const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileName;
    const extension = fileName.split(".")[1];
    const fileD: File = {fileName: req.body.fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

    try {
        await FileDB.addProjectFile(projectD, fileD);
        res.status(200).json("Successfully added new file");
    }
    catch (err) {
        console.log(err);
		res.status(500).json("Failed to add file");
    }
    
}

async function renameFile(req, res){
    const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName}

    const fileName = req.body.fileName;
    const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileName;
    const extension = fileName.split(".")[1];
    const fileD: File = {fileName: req.body.fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

    const newFileName = req.body.newFileName;

    try {
        await FileDB.renameFile(projectD, fileD, newFileName, req.body.userName);
        res.status(200).json("Successfully changed name of file");
    }
    catch (err) {
        console.log(err);
		res.status(500).json("Failed to change name of file");
    }
    
}

async function getFiles(req, res){
    const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName}

    try {
        const files: File[]  = await FileDB.getFiles(projectD);
        console.log(files);
        const fileNames: string[] = files.map((e)=> {return e.filePath})
        res.send(fileNames);
    }
    catch (err) {
        console.log(err);
		res.status(500).json("Failed to change name of file");
    }
    
}

async function fileEdited(req, res) {
    const projectName = req.body.projectName;
    const owner = req.body.owner;
    const fileName = req.body.fileName;
    const userName = req.body.userName;

    try{
		await FileDB.editFileCollaborator(owner, projectName, fileName, userName);
		res.status(200).json("Added user to file collaborator");
	} catch (err) {
        console.log(err);
		res.status(500).json("Failed adding user to collaborators");
	}
}

export { router };