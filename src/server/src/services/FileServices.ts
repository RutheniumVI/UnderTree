import express, {Request, Response} from "express";
import multer from "multer";
import { FileDB } from "../database_interface/FileDB";
import { ProjectData } from "../data/ProjectData";
import { File } from "../data/FileData";

import { AuthUtil } from "../utils/AuthUtil";
import { FileUtil } from "../utils/FileUtil";
import { PersistenceUtil } from "../utils/PersistenceUtil";

const router = express.Router();

router.use(AuthUtil.authorizeJWT);

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);
router.route("/getImage").get(getImage);
router.route("/addFolder").post(addFolder);
router.route("/addFile").post(addFile);
router.route("/renameFile").post(renameFile);
router.route("/getFiles").get(getFiles);
router.route("/fileEdited").post(fileEdited);
router.route("/deleteFile").post(deleteFile);
router.route("/getContentFromFiles").get(getContentFromFiles);
router.route("/uploadTexFile").post(uploadTexFile);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const dirPath = req.body.owner + "/" + req.body.projectName + "/" + req.body.fullDirPath;
		FileUtil.createDirectory(dirPath);
		cb(null, "../file_system/" + dirPath);
	},
	filename: function (req, file, cb) {
		cb(null, req.body.fileName);
	}
});
  
const upload = multer({ storage: storage });
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
		await FileUtil.createPDFOutput(fileName, dirPath, req.body.text);
		res.json("Successfully compiled PDF");
	}
	catch (err) {
		res.json(err);
	}
}

async function getPDF(req, res) {
	const outputFile = req.query.file.replace(".tex", ".pdf");
	const fileData = FileUtil.getFileData("../file_system/" +  outputFile);
	res.set("content-type", "application/pdf");
	res.send(fileData);
}

async function getImage(req, res) {
	const fileData = FileUtil.getFileData("../file_system/" +  req.query.file);
	const fileType = req.query.file.split(".")[1];
	if(fileType === "png"){
		res.set("content-type", "image/png");
	} else {
		res.set("content-type", "image/jpeg");
	}
	res.send(fileData);
}


async function addFolder(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};

	const fileDir = req.body.fullDirPath;

	const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + "March302023";
	const fileD: File = {fileName: "March302023", fileType: "tex", contributors: [], filePath: filePath};

	try {
		await FileDB.addProjectFile(projectD, fileD);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to add file");
	}
}

async function addFile(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};

	const fileDir = req.body.fullDirPath;
	const fileName = req.body.fileName;

	const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + fileName;
	const extension = fileName.split(".")[1];
	const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

	try {
		await FileDB.addProjectFile(projectD, fileD);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to add file");
	}
    
}

async function uploadImage(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};

	const fileDir = req.body.fullDirPath;
	const fileName = req.body.fileName;


	const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + fileName;
	const extension = fileName.split(".")[1];
	const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

	console.log(req.file.filename);
	console.log(fileD);


	try {
		await FileDB.addProjectFile(projectD, fileD);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to add image");
	}
    
}

async function uploadTexFile(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};

	const fileDir = req.body.fullDirPath;
	const fileName = req.body.fileName;
	console.log("ddd", req.body);
	const filePath = projectD.owner + "/" + projectD.projectName + "/" + fileDir + fileName;
	const extension = fileName.split(".")[1];
	const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};


	try {
		await PersistenceUtil.writeDocumentData(filePath, req.body.fileContent);
		await FileDB.addProjectFile(projectD, fileD);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to add file");
	}
    
}

async function renameFile(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};

	const filePath = req.body.filePath;
	const fileName = req.body.fileName;
	const extension = fileName.split(".")[1];
	const fileD: File = {fileName: fileName, fileType: extension, contributors: [req.body.userName], filePath: filePath};

	const sp = filePath.split("/");
	const dirPath = sp.slice(0, -1).join("/") + "/";
	const newFileName = req.body.newFileName;
	const newFilePath = dirPath + newFileName;

	try {
		await FileDB.renameFile(projectD, fileD, newFileName, newFilePath, req.body.userName);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to change name of file");
	}
    
}

async function getFiles(req, res){
	const projectD: ProjectData = {owner: req.query.owner, projectName: req.query.projectName};

	try {
		const fileData = await getFileList(projectD);
		res.send(fileData);
	}
	catch (err) {
		console.log(err);
		res.status(500).json("Failed to change name of file");
	}
    
}

async function deleteFile(req, res){
	const projectD: ProjectData = {owner: req.body.owner, projectName: req.body.projectName};
	const filePath = req.body.filePath;
	const userName = req.body.userName;
	console.log("Deleting using", filePath, userName);

	try{
		await FileDB.deleteFile(projectD, filePath, userName);
		const fileData = await getFileList(projectD);
		res.send(fileData);
	} catch (err) {
		console.log(err);
		res.status(500).json("Failed deleting file");
	}
}

async function fileEdited(req, res) {
	const projectName = req.body.projectName;
	const owner = req.body.owner;
	const filePath = req.body.filePath;
	const userName = req.body.userName;

	try{
		await FileDB.editFileCollaborator(owner, projectName, filePath, userName);
		res.status(200).json("Added user to file collaborator");
	} catch (err) {
		console.log(err);
		res.status(500).json("Failed adding user to collaborators");
	}
}

async function getFileList(project: ProjectData){
	const files: File[]  = await FileDB.getFiles(project);
	const fileData = files.map((e)=> {
		return {
			filePath: e.filePath,
			fileName: e.fileName,
			fileType: e.fileType,
			isModified: e.contributors.length > 0,
			selected: false,
		};}
	);
	return fileData;
}

async function getContentFromFiles(req: Request, res: Response): Promise<void> {
	const files = req.query.files;
	const newFiles = [];

	for(let i = 0; i < files.length; i++){
		let currPath;
		let currContent;

		if (files[i]["fileType"] === "tex" || files[i]["fileType"] === "bib"){
			currPath = files[i]["filePath"].split("/").slice(2).join("/");
			currContent = await PersistenceUtil.getDocumentData(files[i]["filePath"]);
			newFiles.push({ filePath: currPath, content: currContent, fileType: files[i]["fileType"]});
			continue;
		} else {
			currPath = files[i]["filePath"].split("/").slice(2).join("/");
			currContent = FileUtil.getFileData(files[i]["filePath"]).toString("base64");
			newFiles.push({ filePath: currPath, content: currContent, fileType: files[i].fileType});
		}
		console.log(currPath, currContent);
	}
	res.status(200).json(newFiles);
}


export {
	router,
	compilePDF,
	getPDF
};