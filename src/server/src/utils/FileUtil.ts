import { execSync } from 'child_process';
import fs from 'fs';

const dataDirectory = "../file_system";

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

function createDirectory(path: string): void {
    const dirs = path.split("/");
    let currPath = dataDirectory;

    dirs.forEach((dir) => {
        const checkPath = currPath+"/"+dir;
        if(!fs.existsSync(checkPath)){
            fs.mkdirSync(checkPath);
        }
        currPath = checkPath;
    })
}

function saveFile(path: string, content: string): void {
    if(fs.existsSync(path)){
        const dirs = path.split("/");
        const file = dirs[dirs.length-1];
        createDirectory(dirs.splice(-1).join("/"));

        fs.writeFileSync(path, content);
    }
}

function deleteProjectDirectory(projectName: string, owner: string): void {
    const path = dataDirectory+"/"+owner+"/"+projectName;
    if(fs.existsSync(path)){
        fs.rmSync(path, { recursive: true, force: true });
    }
}

function createPDFOutput(file: string, text: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try{
            fs.writeFileSync(dataDirectory+"/"+file, text);
            
            execSync("cd "+dataDirectory+"&& pdflatex "+ dataDirectory+"/"+file);
            resolve("Success");
        } catch (err) {
            reject(err.stdout.toString());
        }
    })
}

function getFileData(file: string){
    if(fs.existsSync(dataDirectory+"/"+file)){
        return fs.readFileSync(dataDirectory+"/"+file);
    } else {
        return fs.readFileSync(dataDirectory+"/default.pdf");
    }
}

const FileUtil = {
    setUpFileSystem,
    createDirectory,
    saveFile,
    deleteProjectDirectory,
    createPDFOutput,
    getFileData
}

export { FileUtil }