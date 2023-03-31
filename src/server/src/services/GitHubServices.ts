import express, { Request, Response } from 'express';
const router = express.Router();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthUtil } from '../utils/AuthUtil';
import { AuthServices } from './AuthServices';
import { GitHubUtil } from '../utils/GitHubUtil';
import axios from "axios";
import { ProjectData } from '../data/ProjectData';
import { ProjectDB } from '../database_interface/ProjectDB';
import { AuthDB } from '../database_interface/AuthDB';
import { FileDB } from '../database_interface/FileDB';
import { FileUtil } from '../utils/FileUtil';

dotenv.config();

router.use(cookieParser());
router.use(AuthUtil.authorizeJWT);

router.route("/repositoryExists").get(repositoryExists);
router.route("/userExists").get(userExists);
router.route("/getUserReposList").get(getUserReposList);
router.route("/commitFiles").post(commitFiles);
router.route("/getGitLog").get(getGitLogForRepo);

async function repositoryExists(req: Request, res: Response): Promise<void> {
	const accessToken = await AuthServices.getUserPropertyWithToken(res.locals.token, "access_token");
	const owner = req.query.owner;
	const name = req.query.name;
	try{
		await axios.get(`https://api.github.com/repos/${owner}/${name}`, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		})
		res.json(true);
	} catch {
		res.json(false);
	}
}

async function userExists(req: Request, res: Response): Promise<void> {
	const accessToken = await AuthServices.getUserPropertyWithToken(res.locals.token, "access_token");
	const name = req.query.name;
	try{
		await axios.get(`https://api.github.com/users/${name}`, {
			headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		})
		res.json(true);
	} catch {
		res.json(false);
	}
}

async function getUserReposList(req: Request, res: Response): Promise<void>  {
  const accessToken = res.locals.accessToken

  let unfilteredRepos = [];
  let repos = [];

  try{
	const reposRes = await axios.get("https://api.github.com/user/repos", {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		params: { affiliation: "owner,collaborator", per_page: "100" },
	})

	unfilteredRepos = reposRes.data;

	for (let i = 0; i < unfilteredRepos.length; i++) {
		let currRepo = unfilteredRepos[i];
		
		let repoDetails: ProjectData = { projectName: currRepo["name"], owner: currRepo["owner"]["login"], isPrivate: currRepo["private"]};
		repos.push(repoDetails);
	}

	res.status(200).json(repos)

  } catch (err) {
		console.log(err);
		res.status(500).json("Failed to get list of user's repositories")
  }
}

async function getGitLogForRepo(req: Request, res: Response): Promise<void> {
	console.log("Route Called: /getGitLog");
	const accessToken = res.locals.accessToken;
	const owner = req.query.owner;
	const repo = req.query.repo;

	let commits = [];

	try {
		const commitsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
		})

		commits = commitsRes.data;

		res.status(200).json(commits)
	} catch (err) {
		console.log(err);
		res.status(500).json("Failed to get list of commits for repository")
	}
}

async function commitFiles(req: Request, res: Response): Promise<void> {
	console.log("\n\ncommiting\n\n");
	console.log(req.body);
	let project: ProjectData = req.body as ProjectData;
	let files = req.body.files;
	const message = req.body.commitMessage;
	const commitPDF = req.body.commitPDF;
	let fileBlobs = [];

	let accessToken = res.locals.accessToken;

	const owner = project.owner;
	const repo = project.projectName;

	let latestCommitSHA = "";
	let latestCommitURL = "";

  	// Get reference to the Main branch
	await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
		}).then((res) => {
		//console.log("Main Branch Data: ", res.data);
		latestCommitSHA = res.data["object"]["sha"];
		latestCommitURL = res.data["object"]["url"];
		}).catch((error) => {
		console.error(error);
		res.status(500).json("Error getting branch reference from GitHub");
		});

	let latestTreeSHA = "";
	let latestTreeURL = "";
  
	// Get the latest commit
	await axios.get(latestCommitURL, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
	}).then((res) => {
		//console.log("Commit Data: ", res.data);
		// latestCommitSHA = res.data["sha"];
		latestTreeSHA = res.data["tree"]["sha"];
		latestTreeURL = res.data["tree"]["url"];
	}).catch((error) => {
		console.error(error);
		res.status(500).json("Error getting latest commit from GitHub");
	});

  	for(let i = 0; i < files.length; i++) {
		let currFile = files[i];

		let encoding = (files[i]["fileType"] === "tex" || files[i]["fileType"] === "bib") ? "utf-8" : "base64";

		// Post the new file to GitHub blobs
		await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
		"content": currFile.content,
		"encoding": encoding
		}, { 
		headers: { 
			Authorization: `Bearer ${accessToken}`, 
			Accept: "application/vnd.github+json" 
		}
		}).then((res) => {
		//console.log("Blob Data: ", res.data);
		fileBlobs.push({ 
			"path": currFile.filePath,
			"mode": "100644",
			"type": "blob", 
			"sha": res.data["sha"]
		})
		}).catch((error) => {
			console.error(error);
			res.status(500).json("Error posting blob to GitHub")
			return;
		});
		
		if(currFile.fileType == "tex" && commitPDF){
			console.log("\n\n\n");
			const pdfPath = owner+"/"+repo+"/"+currFile.filePath.split(".")[0]+".pdf";
			console.log(pdfPath);
			if(FileUtil.fileExists(pdfPath)){
				console.log("exists");
				await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
				"content": FileUtil.getFileData(pdfPath).toString('base64'),
				"encoding": "base64"
				}, { 
					headers: { 
						Authorization: `Bearer ${accessToken}`, 
						Accept: "application/vnd.github+json" 
					}
				}).then((res) => {
					fileBlobs.push({ 
						"path": currFile.filePath.split(".")[0]+".pdf",
						"mode": "100644",
						"type": "blob", 
						"sha": res.data["sha"]
					})
				}).catch((error) => {
					console.error(error);
					res.status(500).json("Error posting blob to GitHub");
					return;
				})
			}
		}

		FileDB.resetFileCollaborator(owner, repo, owner+"/"+repo+"/"+currFile.filePath);
	}


	// Get the latest tree in GitHub
	await axios.get(latestTreeURL, { 
		headers: { 
			Authorization: `Bearer ${accessToken}`, 
			Accept: "application/vnd.github+json" 
		}
		}).then((res) => {
		//console.log("Old Tree Data: ", res.data);
		// latestTreeSHA = res.data["sha"];
		}).catch((error) => {
		console.error(error);
		res.status(500).json("Error getting latest tree from GitHub");
		});

		let userTreeSHA = "";
		let userTreeURL = "";

	// Create a new tree with the new blob data
	await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
		"base_tree": latestTreeSHA,
		"tree": fileBlobs
	}, {
		headers: { 
		Authorization: `Bearer ${accessToken}`, 
		Accept: "application/vnd.github+json" 
		} 
	}).then((res) => {
		//console.log("New Tree Data: ", res.data);
		userTreeSHA = res.data["sha"];
		userTreeURL = res.data["url"];
	}).catch((error) => {
		console.error(error);
		res.status(500).json("Error creating new tree with blob data");
	});

	let userCommitSHA = "";
	let userCommitURL = "";


	// make logic to check if userCommitSHA exists in the project data, 
	// if so, use that as the parent instead of the latest commit SHA
	let commitParent = latestCommitSHA;


	const filePath = project.owner + "/" + project.projectName + "/" + files[0].filePath;
	const contributors = await FileDB.getContributor(project, filePath);
	let comMessage = message + "\n\n\n";
	contributors.forEach((e) => {
		if (e=="fahmed8383"){
			comMessage += "Co-authored-by: Name <" + "fahmed4030@gmail.com" + ">\n"
		}
		if(e == "RutheniumVI"){
			comMessage += "Co-authored-by: Name <" + "veeresh.532000@gmail.com" + ">\n"
		}
		if(e == "KevinRK29"){
			comMessage += "Co-authored-by: Name <" + "kevinrk2000@gmail.com" + ">\n"
		}
		if(e == "quresh00"){
			comMessage += "Co-authored-by: Name <" + "qureshe@mcmaster.ca" + ">\n"
		}
	})

	// Create a new commit with the new tree data
	await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
		"message": comMessage,
		"tree": userTreeSHA,
		"parents": [
		commitParent
		]
	}, {
		headers: {
		Authorization: `Bearer ${accessToken}`,
		Accept: "application/vnd.github+json"
		}
	}).then((res) => {
		//console.log("New Commit Data: ", res.data);
		userCommitSHA = res.data["sha"];
		userCommitURL = res.data["url"];
	}).catch((error) => {
		console.error(error);
		res.status(500).json("Error creating new commit with tree data");
	});

	// PUSH: Update the main branch with the new commit
	await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
		"sha": userCommitSHA,
		"force": true
	}, {
		headers: {
		Authorization: `Bearer ${accessToken}`,
		Accept: "application/vnd.github+json"
		}
	}).then((res) => {
		console.log("Updated Main Branch Data: ", res.data);
	}).catch((error) => {
		console.error(error);
		res.status(500).json("Error updating main branch with new commit");
	});

	res.status(200).json("success");

}

export { router };
