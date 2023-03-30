import React from 'react';

import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'

import randomColor from 'randomcolor';

import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';
import '../Styles/Editor.css'
import "highlight.js/styles/monokai-sublime.css";
import hljs from 'highlight.js'

Quill.register('modules/cursors', QuillCursors);

hljs.configure({
    languages: ['tex'],
    cssSelector: 'div.ql-editor > p'
})

const bindings = {
    'code exit': {
        key: 'Enter',
        collapsed: true,
        format: ['code-block'],
        prefix: /^$/,
        suffix: /^\s*$/,
        handler(range) {
          return true;
        },
    }
};

const modules = {
    cursors: true,
    keyboard: {
        bindings: bindings
    },
    syntax: {
        highlight: text => hljs.highlightAuto(text).value
    }
}

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "code-block"
];

let ydoc = null;
let provider = null;
let binding = null

function Editor({currentFile, setCurrentText}) {
    const username = localStorage.getItem("username");
    const { owner, projectName } = useParams();
    const [value, setValue] = useState('');
    const [modified, setModified] = useState(false);
    const documentID = currentFile.filePath;

    const [commitInfo, setCommitInfo] = useState({projectName: projectName, owner: owner, commitMessage: "", commitPDF: false, files: []});
    const [commitError, setCommitError] = useState("");
    const [modifiedFiles, setModifiedFiles] = useState([]);
    const [selectAllFiles, setSelectAllFiles] = useState(false);

    let quillRef = null;
    let edtRef = null;

    // Connect to socket when editor page is opened
    useEffect(() => {
        quillRef = edtRef.getEditor();
        if(provider){
            ydoc.destroy();
            provider.destroy();
            binding.destroy();
        }

        ydoc = new Y.Doc();   
        provider = new WebsocketProvider(process.env.REACT_APP_SOCKET_URL, documentID, ydoc, {params: {jwt: "123"}});

        const ytext = ydoc.getText('quill');

        const awareness = provider.awareness; 
        
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: username,
          color: color,
        });
        binding = new QuillBinding(ytext, edtRef.getEditor(), awareness);
        

    }, [currentFile])
    
    useEffect(() => {
        if (typeof edtRef.getEditor !== 'function') return;
            quillRef = edtRef.getEditor();
    })

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

        setModified(true);
    }

    function onEditorChanged(content, delta, source, editor){
        setValue(content);
        quillRef.formatLine(0, quillRef.getLength(), { 'code-block': true });
        setCurrentText(editor.getText(content));

        if(!modified && source === "user"){
            addUserToModified();
            setModified(true);
        }
    }

    function openCommitModal(){
        setCommitError("");
        setCommitInfo({projectName: projectName, owner: owner, commitMessage: "", commitPDF: false});
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

    function commitFiles(){
        const info = {...commitInfo};
        info.files = modifiedFiles.filter((file) => {return file.selected});
        if(info.commitMessage.length == 0){
            setCommitError("Commit message can not be empty");
        } else if(info.files.length == 0){
            setCommitError("Atleast one file must be selected to commit");
        } else {
            axios.post(process.env.REACT_APP_API_URL+"/github/commitFiles", {
                info
            }, {
                withCredentials: true,
            }).then((res) => {
                console.log(res.data)
            }).catch((error) => {
                console.error(`Error making commit`);
            });
        }
    }

    return ( 
        <div id='container'>
            <ReactQuill 
                ref={(el) => { edtRef = el; }}
                theme="bubble"
                className="editor"
                modules={modules}
                formats={formats}
                value={value} 
                onChange={onEditorChanged}
                />
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