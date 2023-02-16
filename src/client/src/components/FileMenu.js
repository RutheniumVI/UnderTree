import React from 'react'
import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/FileMenu.css'

function FileMenu({currentFile, setCurrentFile}) {

    const username = localStorage.getItem("username");
    const { owner, projectName } = useParams();
    const tempfiles = ([
        {
            "filePath": "RutheniumVI/veetestrepo/main.tex",
            "fileName": "main.tex",
            "fileType": "tex"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/random.tex",
            "fileName": "rando1.tex",
            "fileType": "tex"
        },
        {
            "filePath": "RutheniumVI/veetestrepo//sad.png",
            "fileName": "sad.png",
            "fileType": "png"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/pihubupload.png",
            "fileName": "pihubupload.png",
            "fileType": "png"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/test/v/amazon.jpg",
            "fileName": "amazon.jpg",
            "fileType": "jpg"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/test/v/sad.png",
            "fileName": "sad.png",
            "fileType": "png"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/test/v/amazon.jpg",
            "fileName": "amazon.jpg",
            "fileType": "jpg"
        },
        {
            "filePath": "RutheniumVI/veetestrepo/test/v/sad.png",
            "fileName": "sad.png",
            "fileType": "png"
        }
    ])

    useEffect(() => {
        axios.get("http://localhost:8000/api/file/getFiles?owner="+owner+"&projectName="+projectName, {withCredentials: true})
        .then((res) => {
            getFileTreeFromFiles(res.data);
            setFiles(res.data);
        })
        .catch((err) => {
            console.log(err)
        })
        // getFileTreeFromFiles(tempfiles);
        // setFiles(tempfiles);
    }, [])

    const [files, setFiles] = useState();
    const [fileTree, setFileTree] = useState({folders: [], files: []});
    const [selectedFileObject, setSelectedFileObject] = useState();
    const [inputtedFilePath, setInputtedFilePath] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [fileToDelete, setFileToDelete] = useState();
    const [fileToEdit, setFileToEdit] = useState();
    const [newFileRename, setNewFileRename] = useState();

    function getFileTreeFromFiles(files){
        let tree = {folders: [], files: []};
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            const dirs = file.filePath.split("/").slice(2);
            tree = createFileTreeNode(tree, dirs, file, "");
        }
        
        setFileTree(tree);
    }

    function createFileTreeNode(tree, path, file, currPath){
        if(path.length == 1){
            tree.files.push(file);
            return tree
        } else {
            for(let i = 0; i < tree.folders.length; i++){
                if(tree.folders[i].name === path[0]){
                    tree.folders[i] = createFileTreeNode(tree.folders[i], path.slice(1), file, currPath+"/"+path[0]);
                    return tree
                }
            }
            const newFolder = {name: path[0], files: [], folders: [], path: currPath+"/"+path[0]};
            tree.folders.push(createFileTreeNode(newFolder, path.slice(1), file, currPath+"/"+path[0]));
            return tree;
        }

    }

    function renderFileMenu(tree, root){
        return(
            <SubMenu label={tree.name} key={tree.path} rootStyles={{backgroundColor: '#DEDEDE'}}>
                {tree.folders.map((folder) => {
                    return renderFileMenu(folder);
                })}
                {tree.files.map((file) => [
                    <MenuItem key={file.filePath} onClick={handleClick} rootStyles={currentFile.filePath === file.filePath ? {backgroundColor: '#d0d0d0'} : {backgroundColor: '#DEDEDE'}}> 
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" onChange={() => {file["selected"] = !file["selected"]}} value="option1"/>
                            <label className="form-check-label fileName" onClick={(e) => {setCurrentFile(file)}}>{file.fileName}</label>
                        </div>
                        <div className='float-end pr'>
                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editFile" icon={faPenToSquare} onClick={(e) => {setFileToEdit(file)}}/>
                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteFile" style={{marginLeft: "15px"}} icon={faTrash} onClick={(e) => {setFileToDelete(file)}}/>
                        </div>  
                    </MenuItem>
                ])}
            </SubMenu>
        );
    }
    
    function selectFile(file){
        // if(selectedFiles.includes(file)){
        //     file["selected"] = false;
        //     setSelectedFiles(selectedFiles.filter((f) => f !== file));
        // } else {
        //     file["selected"] = true;
        //     setSelectedFiles([...selectedFiles, file]);
        // }
    }

    async function commitFiles(){
        console.log("Files in the application: ", files);
        let selectedFiles = files.filter((file) => file.selected);
        if (selectedFiles.length == 0){
            console.log("No files were selected");
            return;
        }
        let filesToCommit = []
        await axios.get("http://localhost:8000/api/file/getContentFromFiles", {
            params: { 
                files: selectedFiles,
                owner: owner,
                projectName: projectName
            },
            withCredentials: true
        }).then((res) => {
            console.log(res.data);
            filesToCommit = res.data;
        }).catch((err) => {
            console.log(err);
        });

        // for(let i = 0; i < files.length; i++){
        //     if(files[i].selected){
        //         // let file = { filepath: files[i]["filePath"], content: "Need to convert file to string" };
        //         filesToCommit.push(files[i]);
        //     }
        // }
        console.log("committing files", owner, projectName);
        console.log("files to commit: ", filesToCommit);
        // for(let i = 0; i < selectedFiles.length; i++){
        //     const file = selectedFiles[i];


        await axios.post("http://localhost:8000/api/github/commitFiles", {
            projectName: projectName,
            owner: owner,
            files: filesToCommit,
          }, {
            withCredentials: true,
          }).then((res) => {
            console.log(res.data)
          }).catch((error) => {
            console.error(`Error making commit`);
          });

    }

    // tree.push(  f1.push(f2)

    function handleClick(){
        // setActive(!active)
        // console.log("clicked")
    }

    function handleConfirmFileUploadClick(){
        console.log(inputtedFilePath)
        console.log(selectedFileObject)

        const sp = inputtedFilePath.split("/");
        const fileName = sp[sp.length-1];
        let dirPath = sp.slice(0, -1).join("/") + "/"
        if(dirPath == "/")
            dirPath = "";
        
        const fileType = selectedFileObject.type;
        if(fileType === "image/png" || fileType == "image/jpeg"){
            const formData = new FormData();
            formData.append("owner", owner);
            formData.append("projectName", projectName);
            formData.append("fullDirPath", dirPath);
            formData.append("fileName", fileName);
            formData.append("image", selectedFileObject);
            axios.post("http://localhost:8000/api/file/uploadImage", formData, {
              withCredentials: true,
              headers: {'Content-Type': 'multipart/form-data'}
            }).then((res) => {
                getFileTreeFromFiles(res.data);
                setFiles(res.data);
            }).catch((error) => {
              console.error(`Error Adding user to modified`);
            });
        } else {
            var reader = new FileReader();
            reader.readAsText(selectedFileObject, "UTF-8");
            console.log(fileName)
            reader.onload = function (evt) {
                axios.post("http://localhost:8000/api/file/uploadTexFile", {
                    owner: owner,
                    projectName: projectName,
                    fileName: fileName,
                    userName: username,
                    fullDirPath: dirPath,
                    fileContent: evt.target.result
                }, {
                  withCredentials: true
                }).then((res) => {
                    getFileTreeFromFiles(res.data);
                    setFiles(res.data);
                }).catch((error) => {
                  console.error(`Error Adding user to modified`);
                });
            }
            reader.onerror = function (evt) {
                console.log("Error reading file data");
            }
        }
    }

    function handleConfirmNewFileClick(){
        console.log(newFileName)
        const sp = newFileName.split("/");
        const fileName = sp[sp.length-1];
        let dirPath = sp.slice(0, -1).join("/") + "/";
        if(dirPath == "/")
            dirPath = "";

        axios.post("http://localhost:8000/api/file/addFile", {
            owner: owner,
            projectName: projectName,
            fileName: fileName,
            userName: username,
            fullDirPath: dirPath
        }, {
          withCredentials: true,
        }).then((res) => {
            console.log(res.data);
            getFileTreeFromFiles(res.data);
            setFiles(res.data);
        }).catch((error) => {
          console.error(`Error Adding user to modified`);
        });
    }

    function handleConfirmDeleteClick(){
        console.log(fileToDelete)

        axios.post("http://localhost:8000/api/file/deleteFile", {
            owner: owner,
            projectName: projectName,
            filePath: fileToDelete.filePath,
            userName: username,
        }, {
          withCredentials: true,
        }).then((res) => {
            console.log(res.data);
            getFileTreeFromFiles(res.data);
            setFiles(res.data);
        }).catch((error) => {
          console.error(`Error Adding user to modified`);
        });

    }

    function handleEditFileConfirm(){
        console.log(fileToEdit)
        console.log(newFileRename)
        

        axios.post("http://localhost:8000/api/file/renameFile", {
            owner: owner,
            projectName: projectName,
            filePath: fileToEdit.filePath,
            fileName: fileToEdit.fileName,
            userName: username,
            newFileName: newFileRename
        }, {
          withCredentials: true,
        }).then((res) => {
            getFileTreeFromFiles(res.data);
            setFiles(res.data);
        }).catch((error) => {
          console.error(`Error Adding user to modified`);
        });
    }

    return (
        <div>
        <div className='my-card'>
            <div>
                <i className="bi bi-folder-plus fileButton"></i>
                <i className="bi bi-file-earmark-plus fileButton" data-bs-toggle="modal" data-bs-target="#newFile"></i>
                <i className="bi bi-cloud-upload fileButton" data-bs-toggle="modal" data-bs-target="#fileUpload"></i>
                <i className="bi bi-github fileButton" onClick={commitFiles}></i>
            </div>
            <ProSidebarProvider>
            <Sidebar width='100%' backgroundColor='#DEDEDE' breakPoint='sm'>
                <Menu>
                    {fileTree.folders.map((folder) => {
                        return renderFileMenu(folder);
                    })}
                   
                    {fileTree.files.map((file) => {
                        return <MenuItem key={file.filePath} onClick={handleClick} rootStyles={{backgroundColor: '#DEDEDE'}}> 
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" onChange={() => {file["selected"] = !file["selected"]}} value="option1"/>
                                <label className="form-check-label fileName" onClick={(e) => {setCurrentFile(file)}}>{file.fileName}</label>
                            </div>
                            <div className='float-end pr'>
                                <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editFile" icon={faPenToSquare} onClick={(e) => {setFileToEdit(file)}}/>
                                <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteFile" style={{marginLeft: "15px"}} icon={faTrash} onClick={(e) => {setFileToDelete(file)}}/>
                            </div>     
                        </MenuItem>
                    })}
                </Menu>
            </Sidebar>
            </ProSidebarProvider>
        </div>

        <div className="modal fade" id="fileUpload" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="fileUploadLabel" aria-hidden="true">
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header my-modal-header">
                <h1 className="modal-title fs-5" id="fileUploadLabel">File Upload</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body my-modal-body">
                <label className="form-label"> <h6>File Name:</h6></label>
                    <div className="input-group">
                        <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" 
                        onChange={(event) => {
                        setInputtedFilePath(event.target.value);
                        }}/>      
                    </div>
                    <div className="input-group" style={{"marginTop" : "5%"}} >
                    <input type="file" id="input" multiple onChange={(event)=> {setSelectedFileObject(document.getElementById('input').files[0])}}/>
                    </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleConfirmFileUploadClick}>Confirm</button>
                </div>
            </div>
            </div>
        </div>

        <div className="modal fade" id="newFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="newFileLabel" aria-hidden="true">
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header my-modal-header">
                <h1 className="modal-title fs-5" id="newFileLabel">New File</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body my-modal-body">
                <label className="form-label"> <h6>File Name:</h6></label>
                    <div className="input-group">
                    <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"
                    onChange={(event) => {
                        setNewFileName(event.target.value);
                    }}/>
                </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleConfirmNewFileClick}>Confirm</button>
                </div>
            </div>
            </div>
        </div>

        <div className="modal fade" id="editFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="editFileLabel" aria-hidden="true">
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header my-modal-header">
                    <h1 className="modal-title fs-5" id="editFileLabel">Edit File</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body my-modal-body">
                    <label className="form-label"> <h6>New File Name:</h6></label>
                    <div className="input-group">
                    <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" onChange={(event) => {
                        setNewFileRename(event.target.value);
                    }}/>
                </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleEditFileConfirm}>Confirm</button>
                </div>
            </div>
            </div>
        </div>

        <div className="modal fade" id="deleteFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="deleteFileLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header my-modal-header">
                        <h1 className="modal-title fs-5" id="deleteFileLabel">Delete File</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body my-modal-body">
                    <p>Are you sure you want to delete this file?</p>
                    </div>
                    <div className="modal-footer my-modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleConfirmDeleteClick}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default FileMenu;