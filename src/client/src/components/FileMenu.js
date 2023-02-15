import React from 'react'
import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/FileMenu.css'

function FileMenu() {

    const { owner, projectName } = useParams();

    useEffect(() => {
        axios.get("http://localhost:8000/api/file/getFiles?owner="+owner+"&projectName="+projectName, {withCredentials: true})
        .then((res) => {
            getFileTreeFromFiles(res.data);
            setFiles(res.data);
        })
        .catch((err) => {
            console.log(err)
        })
    }, [])

    const [files, setFiles] = useState();

    const [fileTree, setFileTree] = useState({folders: [], files: []});

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
                    <MenuItem key={file.filePath} onClick={handleClick} rootStyles={{backgroundColor: '#DEDEDE'}}> 
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label">{file.fileName}</label>
                        </div>
                        <div className='float-end pr'>
                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editFile" icon={faPenToSquare} onClick={(e) => {selectProject(i)}}/>
                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteFile" style={{marginLeft: "15px"}} icon={faTrash} onClick={(e) => {selectProject(i)}}/>
                        </div>  
                    </MenuItem>
                ])}
            </SubMenu>
        );
    }
    

    // tree.push(  f1.push(f2)

    function handleClick(){
        //setActive(!active)
        // console.log("clicked")
    }

    return (
        <div>
        <div className='my-card'>
            <div>
                <i className="bi bi-folder-plus fileButton"></i>
                <i className="bi bi-file-earmark-plus fileButton" data-bs-toggle="modal" data-bs-target="#newFile"></i>
                <i className="bi bi-cloud-upload fileButton" data-bs-toggle="modal" data-bs-target="#fileUpload"></i>
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
                                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                                <label className="form-check-label">{file.fileName}</label>
                            </div>
                            <i className="bi bi-three-dots-vertical float-end pr fileDropDown" data-bs-toggle="dropdown" aria-expanded="false"></i>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Edit File</a></li>
                                <li><a className="dropdown-item" href="#"data-bs-toggle="modal" data-bs-target="#deleteFile">Delete File</a></li>
                            </ul>    
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
                <label className="form-label"> <h6>Project Name:</h6></label>
                    <div className="input-group">
                    <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"/>
                </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark">Confirm</button>
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
                <label className="form-label"> <h6>Project Name:</h6></label>
                    <div className="input-group">
                    <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"/>
                </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark">Confirm</button>
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
                    <label className="form-label"> <h6>Project Name:</h6></label>
                    <div className="input-group">
                    <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"/>
                </div>
                </div>
                <div className="modal-footer my-modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark">Confirm</button>
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
                        <button type="button" className="btn btn-dark">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        
    )
}

export default FileMenu;