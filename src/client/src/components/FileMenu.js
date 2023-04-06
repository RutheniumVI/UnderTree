import React from 'react'
import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/FileMenu.css'

function FileMenu({ currentFile, setCurrentFile }) {

	const username = localStorage.getItem("username");
	const { owner, projectName } = useParams();

	useEffect(() => {
		axios.get(process.env.REACT_APP_API_URL + "/file/getFiles?owner=" + owner + "&projectName=" + projectName, { withCredentials: true })
			.then((res) => {
				getFileTreeFromFiles(res.data);
				setFiles(res.data);
			})
			.catch((err) => {
				console.log(err)
			})

		document.addEventListener("click", handleClick);
		$("#context-menu a").on("click", function () {
			$(this).parent().removeClass("show").hide();
		});

		return () => {
			document.removeEventListener("click", handleClick);
		}
	}, [])

	const [files, setFiles] = useState();
	const [fileTree, setFileTree] = useState({ folders: [], files: [] });
	const [selectedFileObject, setSelectedFileObject] = useState();
	const [inputtedFilePath, setInputtedFilePath] = useState("");
	const [newFileName, setNewFileName] = useState("");
	const [fileToDelete, setFileToDelete] = useState();
	const [fileToEdit, setFileToEdit] = useState();
	const [newFileRename, setNewFileRename] = useState();
	const [selectedFile, setSelectedFile] = useState("");

	function getFileTreeFromFiles(files) {
		let tree = { folders: [], files: [] };
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const dirs = file.filePath.split("/").slice(2);
			tree = createFileTreeNode(tree, dirs, file, "");
		}

		setFileTree(tree);
	}

	function createFileTreeNode(tree, path, file, currPath) {
		if (path.length == 1) {
			if (file.fileName != "March302023")
				tree.files.push(file);
			return tree
		} else {
			for (let i = 0; i < tree.folders.length; i++) {
				if (tree.folders[i].name === path[0]) {
					tree.folders[i] = createFileTreeNode(tree.folders[i], path.slice(1), file, currPath + "/" + path[0]);
					return tree
				}
			}
			const newFolder = { name: path[0], files: [], folders: [], path: currPath + "/" + path[0] };
			tree.folders.push(createFileTreeNode(newFolder, path.slice(1), file, currPath + "/" + path[0]));
			return tree;
		}

	}

	function handleFolderRightClick(e) {
		e.preventDefault();
		var top = e.pageY - 10;
		var left = e.pageX - 90;
		$("#context-menu").css({
			display: "block",
			top: top,
			left: left
		}).addClass("show");
	}

	function renderFileMenu(tree, root) {
		return (
			<SubMenu className="folder" label={tree.name} key={tree.path} rootStyles={selectedFile === tree.path ? { backgroundColor: '#d0d0d0' } : { backgroundColor: "#DEDEDE" }}
				onContextMenu={(e) => { handleFolderRightClick(e); setSelectedFile(tree.path); return false }}
				onClick={(e) => { e.stopPropagation(); setSelectedFile(tree.path) }}>
				{tree.folders.map((folder) => {
					return renderFileMenu(folder);
				})}
				{tree.files.map((file) => [
					<MenuItem key={file.filePath} rootStyles={{ backgroundColor: "#DEDEDE" }} onClick={(e) => { e.stopPropagation(); setCurrentFile(file) }}>
						<div className="form-check form-check-inline">
							<input className="form-check-input" type="checkbox" id="inlineCheckbox1" onChange={() => { file["selected"] = !file["selected"] }} value="option1" />
							<label className="form-check-label fileName"
								style={currentFile.filePath === file.filePath ? { color: 'red' } : { color: "blue" }}
							>{file.fileName}
							</label>
						</div>
						<div className='float-end pr'>
							<FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editFile" icon={faPenToSquare} onClick={(e) => { setFileToEdit(file) }} />
							<FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteFile" style={{ marginLeft: "15px" }} icon={faTrash} onClick={(e) => { setFileToDelete(file) }} />
						</div>
					</MenuItem>
				])}
			</SubMenu>
		);
	}

	function handleClick() {
		$("#context-menu").removeClass("show").hide();
	}

	function handleConfirmFileUploadClick() {
		handleModalClose();

		console.log(selectedFileObject)

		// const sp = inputtedFilePath.split("/");
		const fileName = selectedFileObject.name;
		// let dirPath = sp.slice(0, -1).join("/") + "/"
		// if(dirPath == "/")
		//     dirPath = "";

		let dirPath = ""
		// Remove leading / and add a / at the end
		if (selectedFile)
			dirPath = selectedFile.substring(1) + "/";
		const fileType = selectedFileObject.type;
		if (fileType === "image/png" || fileType == "image/jpeg") {
			const formData = new FormData();
			formData.append("owner", owner);
			formData.append("projectName", projectName);
			formData.append("fullDirPath", dirPath);
			formData.append("fileName", fileName);
			formData.append("image", selectedFileObject);
			formData.append("userName", username);
			axios.post(process.env.REACT_APP_API_URL + "/file/uploadImage", formData, {
				withCredentials: true,
				headers: { 'Content-Type': 'multipart/form-data' }
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
				axios.post(process.env.REACT_APP_API_URL + "/file/uploadTexFile", {
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

	function handleConfirmNewFileClick() {
		handleModalClose();

		console.log(newFileName)
		const sp = newFileName.split("/");
		const fileName = sp[sp.length - 1];
		let dirPath = sp.slice(0, -1).join("/") + "/";
		if (dirPath == "/")
			dirPath = "";

		// Remove leading / and add a / at the end
		if (selectedFile)
			dirPath = selectedFile.substring(1) + "/" + dirPath;

		axios.post(process.env.REACT_APP_API_URL + "/file/addFile", {
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

	function handleConfirmNewFolderClick() {
		handleModalClose();

		console.log(newFileName)
		let dirPath = newFileName + "/";

		// Remove leading / and add a / at the end
		if (selectedFile)
			dirPath = selectedFile.substring(1) + "/" + dirPath;

		axios.post(process.env.REACT_APP_API_URL + "/file/addFolder", {
			owner: owner,
			projectName: projectName,
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

	function handleConfirmDeleteClick() {
		console.log(fileToDelete)

		axios.post(process.env.REACT_APP_API_URL + "/file/deleteFile", {
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

	function handleEditFileConfirm() {
		console.log(fileToEdit)
		console.log(newFileRename)


		axios.post(process.env.REACT_APP_API_URL + "/file/renameFile", {
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

	function handleModalClose() {
		$("#fileUpload").find("input").val('').end();
		$("#newFile").find("input").val('').end();
	}

	return (
		<div>
			<div className='my-card' onClick={(e) => { setSelectedFile("") }}>
				<div>
					<i className="bi bi-folder-plus fileButton" data-bs-toggle="modal" data-bs-target="#newFolder" onClick={(e) => { e.stopPropagation() }}></i>
					<i className="bi bi-file-earmark-plus fileButton" data-bs-toggle="modal" data-bs-target="#newFile" onClick={(e) => { e.stopPropagation() }}></i>
					<i className="bi bi-cloud-upload fileButton" data-bs-toggle="modal" data-bs-target="#fileUpload" onClick={(e) => { e.stopPropagation() }}></i>
				</div>
				<ProSidebarProvider>
					<Sidebar width='100%' backgroundColor='#DEDEDE' breakPoint='sm'>
						<Menu>
							{fileTree.folders.map((folder) => {
								return renderFileMenu(folder);
							})}

							{fileTree.files.map((file) => {
								return <MenuItem key={file.filePath} onClick={(e) => { handleClick; setCurrentFile(file) }} rootStyles={{ backgroundColor: '#DEDEDE' }}>
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="checkbox" id="inlineCheckbox1" onChange={() => { file["selected"] = !file["selected"] }} value="option1" />
										<label className="form-check-label fileName"
											style={currentFile.filePath === file.filePath ? { color: 'red' } : { color: "blue" }}
										>{file.fileName}
										</label>
									</div>
									<div className='float-end pr'>
										<FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editFile" icon={faPenToSquare} onClick={(e) => { setFileToEdit(file) }} />
										<FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteFile" style={{ marginLeft: "15px" }} icon={faTrash} onClick={(e) => { setFileToDelete(file) }} />
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
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={(e) => { handleModalClose() }}></button>
						</div>
						<div className="modal-body my-modal-body">
							{/* <label className="form-label"> <h6>File Name:</h6></label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" 
                            onChange={(event) => {
                            setInputtedFilePath(event.target.value);
                            }}/>      
                        </div> */
							}
							<div className="input-group" style={{ "marginTop": "5%" }} >
								<input type="file" id="input" multiple onChange={(event) => { setSelectedFileObject(document.getElementById('input').files[0]) }} />
							</div>
						</div>
						<div className="modal-footer my-modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={(e) => { handleModalClose() }}>Close</button>
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
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={(e) => { handleModalClose() }}></button>
						</div>
						<div className="modal-body my-modal-body">
							<label className="form-label"> <h6>File Name:</h6></label>
							<div className="input-group">
								<input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"
									onChange={(event) => {
										setNewFileName(event.target.value);
									}} />
							</div>
						</div>
						<div className="modal-footer my-modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={(e) => { handleModalClose() }}>Close</button>
							<button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleConfirmNewFileClick} >Confirm</button>
						</div>
					</div>
				</div>
			</div>

			<div className="modal fade" id="newFolder" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="newFileLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header my-modal-header">
							<h1 className="modal-title fs-5" id="newFolderLabel">New Folder</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={(e) => { handleModalClose() }}></button>
						</div>
						<div className="modal-body my-modal-body">
							<label className="form-label"> <h6>Folder Name:</h6></label>
							<div className="input-group">
								<input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3"
									onChange={(event) => {
										setNewFileName(event.target.value);
									}} />
							</div>
						</div>
						<div className="modal-footer my-modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={(e) => { handleModalClose() }}>Close</button>
							<button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={handleConfirmNewFolderClick} >Confirm</button>
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
								}} />
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

			<div class="dropdown-menu dropdown-menu-sm" id="context-menu">
				<a class="dropdown-item" onClick={(e) => { $('#newFile').modal('toggle'); }}>New File</a>
				<a class="dropdown-item" onClick={(e) => { $('#newFolder').modal('toggle'); }}>New Folder</a>
				<a class="dropdown-item" onClick={(e) => { $('#fileUpload').modal('toggle'); }}>Upload File</a>
			</div>
		</div>
	)
}

export default FileMenu;