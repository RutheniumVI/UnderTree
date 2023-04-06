/*
Author: Faiq Ahmed
Date: February 16, 2023
Purpose: File Util Module, contains the utility functions for all File related functionality that are used throughout the project
*/

import { execSync } from "child_process";
import fs from "fs";

import { PersistenceUtil } from "../utils/PersistenceUtil";

const dataDirectory = "../file_system";

// Set up the file system if it does not exist
function setUpFileSystem(): void{
	if(!fs.existsSync(dataDirectory)){
		fs.mkdirSync(dataDirectory);
		fs.writeFileSync(dataDirectory+"/default.pdf", "%PDF-1.4\n%����\n1 0 obj\
        \n<</Title (Untitled document)\n/Producer (Skia/PDF m111 Google Docs Renderer)>>\
        \nendobj\n3 0 obj\n<</ca 1\n/BM /Normal>>\nendobj\n4 0 obj\n<</Length 84>> stream\
        \n1 0 0 -1 0 842 cm\nq\n.75 0 0 .75 0 0 cm\n1 1 1 RG 1 1 1 rg\n/G3 gs\n0 0 794 1123 re\
        \nf\nQ\n\nendstream\nendobj\n2 0 obj\n<</Type /Page\
        \n/Resources <</ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/ExtGState <</G3 3 0 R>>>>\
        \n/MediaBox [0 0 596 842]\n/Contents 4 0 R\n/StructParents 0\n/Parent 5 0 R>>\nendobj\
        \n5 0 obj\n<</Type /Pages\n/Count 1\n/Kids [2 0 R]>>\nendobj\n6 0 obj\n<</Type /Catalog\
        \n/Pages 5 0 R>>\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000015 00000 n\
        \n0000000277 00000 n\n0000000108 00000 n\n0000000145 00000 n\n0000000465 00000 n\
        \n0000000520 00000 n\ntrailer\n<</Size 7\n/Root 6 0 R\n/Info 1 0 R>>\nstartxref\
        \n567\n%%EOF");
	}
}

// Create directories in the file system given a path
function createDirectory(path: string): void {
	const dirs = path.split("/");
	let currPath = dataDirectory;

	dirs.forEach((dir) => {
		const checkPath = currPath+"/"+dir;
		if(!fs.existsSync(checkPath)){
			fs.mkdirSync(checkPath);
		}
		currPath = checkPath;
	});
}

// Save a file to the file system if it doesn't exist 
function saveFile(path: string, content: string | Buffer): void {
	if(!fs.existsSync(dataDirectory+"/"+path)){
		const dirPath = path.split("/").slice(0, -1).join("/");
		createDirectory(dirPath);
		fs.writeFileSync(dataDirectory+"/"+path, content);
	}
}

// If the path directory exists, it deletes it
function deleteProjectDirectory(projectName: string, owner: string): void {
	const path = dataDirectory+"/"+owner+"/"+projectName;
	if(fs.existsSync(path)){
		fs.rmSync(path, { recursive: true, force: true });
	}
}

// Creates the PDF content and path for a given file
function createPDFOutput(file: string, dir: string, content: string): Promise<string> {
	return new Promise(async (resolve, reject) => {
		try{
			const containsBib = content.match(/\\bibliography{.+}/g);
			if(containsBib !== null){
				const bibFile = containsBib[0].substring(14,containsBib[0].length-1);

				const bibRelPath = bibFile.split("/");
				let i = 0;
				for(i = 0; i < bibRelPath.length; i++){
					if(bibRelPath[i] === ".."){
						bibRelPath.shift();
					} else {
						break;
					}
				}

				const filePath = file.split("/");
				const bibFilePath = dir + filePath.slice(0, filePath.length-i-1).concat(bibRelPath).join("/")+".bib";

				fs.writeFileSync(dataDirectory + "/" + bibFilePath, await PersistenceUtil.getDocumentData(bibFilePath));
			}
			fs.writeFileSync(dataDirectory + "/" + dir + file, content);
			const latexCommand = "&& pdflatex " + file;
            
			if(containsBib !== null){
				execSync("cd " + dataDirectory + "/" + dir + latexCommand + "&& bibtex " + file.split(".")[0] + latexCommand + latexCommand);
			} else {
				execSync("cd " + dataDirectory + "/" + dir + latexCommand);
			}
			resolve("Success");
		} catch (err) {
			reject(err.stdout.toString());
		}
	});
}

// Get the file data from the file system
function getFileData(file: string){
	if(fs.existsSync(dataDirectory+"/"+file)){
		return fs.readFileSync(dataDirectory+"/"+file);
	} else {
		return fs.readFileSync(dataDirectory+"/default.pdf");
	}
}

// Checks if a file exists in the file system
function fileExists(file: string): boolean {
	if(fs.existsSync(dataDirectory+"/"+file)){
		return true;
	} else {
		return false;
	}
}

const FileUtil = {
	setUpFileSystem,
	createDirectory,
	saveFile,
	deleteProjectDirectory,
	createPDFOutput,
	getFileData,
	fileExists,
};

export { FileUtil };