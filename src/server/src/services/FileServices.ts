import express from 'express';
import multer from "multer";
import { FileDB } from '../database_interface/FileDB.js';
import { ProjectData } from '../data/ProjectData.js';
import { File } from '../data/FileData.js';

import { AuthUtil } from '../utils/AuthUtil.js';
import { FileUtil } from '../utils/FileUtil.js';
import { PersistenceUtil } from '../utils/PersistenceUtil.js';

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
// router.use(AuthUtil.authorizeProjectAccess);

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);
router.route("/getImage").get(getImage);
router.route("/addFile").post(addFile);
router.route("/renameFile").post(renameFile);
router.route("/getFiles").get(getFiles);
router.route("/fileEdited").post(fileEdited);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dirPath = req.body.owner + "/" + req.body.projectName + "/" + req.body.fullDirPath;
        FileUtil.createDirectory(dirPath);
        cb(null, "../file_system/" + dirPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
  
const upload = multer({ storage: storage })
router.route("/uploadImage").post(upload.single("image"), uploadImage);

async function compilePDF(req, res){
    const documentId = req.body.documentId;
    console.log(documentId);
    const lastS = documentId.lastIndexOf("/");
    const dirPath = documentId.substring(0, lastS+1);
    const fileName = documentId.substring(lastS+1);
    const outputFileName = dirPath + fileName.split(".")[0] + ".pdf";
    
    try {
        await FileUtil.createDirectory(dirPath);
        await FileUtil.createPDFOutput(fileName, dirPath, req.body.text)
        // const fileData = FileUtil.getFileData("../file_system/" + dirPath + outputFileName);
        res.json("Successfully compiled PDF");
    }
    catch (err) {
        res.json(err);
    }
}

async function getPDF(req, res) {
    const outputFile = req.query.file.replace(".tex", ".pdf");
    const fileData = FileUtil.getFileData("../file_system/" +  outputFile);
    res.set('content-type', "application/pdf");
    res.send(fileData);
}

async function getImage(req, res) {
    const fileData = FileUtil.getFileData("../file_system/" +  req.query.file);
    const fileType = req.query.file.split(".")[1];
    if(fileType === "png"){
        res.set('content-type', "image/png");
    } else {
        res.set('content-type', "image/jpeg");
    }
    res.send(fileData);
}

async function addFile(req, res){
    const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName}

    const fileDir = req.body.fullDirPath;
    const fileName = req.body.fileName;

    const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + fileName;
    const extension = fileName.split(".")[1];
    const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

    try {
        await FileDB.addProjectFile(projectD, fileD);
        res.status(200).json("Successfully added new file");
    }
    catch (err) {
        console.log(err);
		res.status(500).json("Failed to add file");
    }
    
}

async function uploadImage(req, res){
    const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName}

    const fileDir = req.body.fullDirPath;
    const fileName = req.file.filename;


    const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + fileName;
    const extension = fileName.split(".")[1];
    const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

    //TODO: check image type


    console.log(req.file.filename);
    console.log(fileD);


    try {
        await FileDB.addProjectFile(projectD, fileD);
        res.status(200).json("Successfully added new image");
    }
    catch (err) {
        console.log(err);
		res.status(500).json("Failed to add image");
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
    const projectD: ProjectData = {owner: req.query.owner, projectName: req.query.projectName}

    try {
        const files: File[]  = await FileDB.getFiles(projectD);
        console.log(files);
        const fileData = files.map((e)=> {
            return {
                filePath: e.filePath,
                fileName: e.fileName,
                fileType: e.fileType,
                selected: false,
            }}
        );
        res.send(fileData);
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