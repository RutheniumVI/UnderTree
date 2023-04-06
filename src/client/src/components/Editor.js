import React, { useLayoutEffect } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import io from "socket.io-client";

import randomColor from 'randomcolor';
import '../Styles/Editor.css'
import CodeMirror from 'codemirror'
import { CodemirrorBinding } from 'y-codemirror'
import 'codemirror/mode/stex/stex'


// Define editor-related variables globally so they can be reused when editor is reopened
let ydoc = null;
let provider = null;
let binding = null;
let editorc = null;
let documentID = null;
let modified = false;

function Editor({currentFile, setCurrentText}) {
    const username = localStorage.getItem("username");
    const { owner, projectName } = useParams();
    documentID = currentFile.filePath; //documentID for synchronization is going to be the file full path

    const [commitInfo, setCommitInfo] = useState({projectName: projectName, owner: owner, commitMessage: "", commitPDF: false, files: []});
    const [commitError, setCommitError] = useState("");
    const [modifiedFiles, setModifiedFiles] = useState([]);
    const [selectAllFiles, setSelectAllFiles] = useState(false);

    let quillRef = null;
    let edtRef = null;

    useLayoutEffect(() => {
        editorc = null;
    }, [])

    useEffect(() => {
        quillRef = edtRef;

        // if previous instance of editor exists, destroy variables associated to previous instance of editor
        if(provider){ 
            ydoc.destroy();
            provider.destroy();
            binding.destroy();
        }

        ydoc = new Y.Doc();
        // authentication is not setup for websocketprovider   
        provider = new WebsocketProvider(process.env.REACT_APP_SOCKET_URL, documentID, ydoc, {params: {jwt: "123"}});

        const ytext = ydoc.getText('quill');
        // awareness handles cursor postion
        const awareness = provider.awareness; 
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: username,
          color: color,
        });

        //making sure previous instance of editor does not exist
        if(!editorc) {
            editorc = CodeMirror(edtRef, {
                mode: 'stex',
                lineNumbers: true,
                lineWrapping: true
            })
            editorc.setSize("100%", "calc(100vh - 135px)");
            editorc.on("change", (instance, changeObject)=>{
                if(changeObject.origin === "+input" || changeObject.origin === "+delete"){
                    onEditorChanged();
                }
            })
        }

        binding = new CodemirrorBinding(ytext, editorc, awareness);
        binding.on('cursorActivity', (editor)=>{setCurrentText(editorc.getValue())})

    }, [currentFile])
    

    /**
     * This function calls the API to add user to the files contributor list
     */
    function addUserToModified(){

        console.log("Adding user to modified");    

        const fileDetails = documentID.split('/');

        axios.post(process.env.REACT_APP_API_URL+"/file/fileEdited", {
            owner: fileDetails[0],
            projectName: fileDetails[1],
            filePath: documentID,
            userName: username
        }, {
          withCredentials: true,
        }).then((res) => {
          console.log(res.data)
        }).catch((error) => {
          console.error(`Error Adding user to modified`);
        });

        modified = true;
    }

    /**
     * This is triggered when the editor content is changed by the user
     */
    function onEditorChanged(setMod){
        if(!modified) {
            addUserToModified(); 
        }
        
    }

    /**
     * This function will get the list of file changed using an API call to display in the modal
     */
    function openCommitModal(){
        setCommitError("");
        setCommitInfo({projectName: projectName, owner: owner, username:  username, commitMessage: "", commitPDF: false});
        axios.get(process.env.REACT_APP_API_URL+"/file/getFiles?owner="+owner+"&projectName="+projectName, {withCredentials: true})
        .then((res) => {
            console.log(res.data);
            setModifiedFiles(res.data.filter((file) => {return file.isModified}));
            console.log(res.data.filter((file) => {return file.isModified}));
        })
        .catch((err) => {
            console.log(err)
        })
    }

    /**
     * This function is a handler for when the commit button is pressed
     */
    async function commitFiles(){
        const selectedFiles = modifiedFiles.filter((file) => {return file.selected});
        const info = {...commitInfo};
        if(info.commitMessage.length == 0){
            setCommitError("Commit message can not be empty");
        } else if(selectedFiles == 0){
            setCommitError("Atleast one file must be selected to commit");
        } else {
            let filesToCommit = []
            await axios.get(process.env.REACT_APP_API_URL+"/file/getContentFromFiles", {
                params: { 
                    files: modifiedFiles.filter((file) => {return file.selected}),
                    owner: owner,
                    projectName: projectName
                },
                withCredentials: true
            }).then((res) => {
                filesToCommit = res.data;
            }).catch((err) => {
                console.log(err);
            });
            info.files = filesToCommit;

            await axios.post(process.env.REACT_APP_API_URL+"/github/commitFiles", info, {
                withCredentials: true,
            }).then((res) => {
                document.getElementById('commitModalClose').click();
                modified = false;
            }).catch((error) => {
                console.error(`Error making commit`);
            });
        }
    }

    return ( 
        <div id='container'>
            <button className="btn btn-dark float-end me-2" onClick={openCommitModal} data-bs-toggle="modal" data-bs-target="#commitModal">Commit Files</button>
            <div id='editor' ref={(el) => { edtRef = el; }}>

            </div>
            <div className="modal fade" id="commitModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="commitModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="commitModalLabel">Commit Files</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='commitModalClose'></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Select Files To Commit:</label>
                            <div className="mb-3 form-check commitFiles">
                                <input type="checkbox" className="form-check-input" checked={selectAllFiles} onChange={(e) => {
                                    setSelectAllFiles(e.target.checked);
                                    let newArray = [...modifiedFiles];
                                    newArray.forEach((file) => {
                                        file.selected = e.target.checked;
                                    })
                                    setModifiedFiles(newArray);
                                }}/>
                                <label className="form-check-label">Select All</label>
                            </div>
                            <div className='modifiedFilesList'>
                                {modifiedFiles.map((file, i) => 
                                    <div key={i} className='row importProjectItem'>
                                        <div className="mb-3 form-check">
                                            <input type="checkbox" className="form-check-input" checked={modifiedFiles[i].selected} onChange={(e) => {
                                                let newArray = [...modifiedFiles];
                                                newArray[i].selected = e.target.value;
                                                setModifiedFiles(newArray);
                                            }}/>
                                            <label className="form-check-label">{file.filePath.split("/").splice(2).join("/")}</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Commit Message:</label>
                            <textarea className="form-control" onChange={(e) => {setCommitInfo({...commitInfo, commitMessage: e.target.value})}} value={commitInfo.commitMessage}/>
                        </div>
                        <div className="mb-3 form-check">
                            <input type="checkbox" className="form-check-input" checked={commitInfo.commitPDF} onChange={(e) => {setCommitInfo({...commitInfo, commitPDF: e.target.checked})}}/>
                            <label className="form-check-label">Commit Associated PDF Files</label>
                        </div>
                        <div className="errorMessage">{commitError}</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-dark" onClick={commitFiles} >Commit & Push</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor