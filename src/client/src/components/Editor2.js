import React from 'react';

import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'

import randomColor from 'randomcolor';

import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import '../Styles/Editor.css'
import hljs from 'highlight.js'
import CodeMirror from 'codemirror'
import { CodemirrorBinding } from 'y-codemirror'
import 'codemirror/mode/stex/stex'


let ydoc = null;
let provider = null;
let binding = null;
let editorc = null;

function Editor({currentFile, setCurrentText}) {
    const username = localStorage.getItem("username");
    const [value, setValue] = useState('');
    const [modified, setModified] = useState(false);
    const documentID = currentFile.filePath;

    let quillRef = null;
    let edtRef = null;




    // Connect to socket when editor page is opened
    useEffect(() => {
        quillRef = edtRef;
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

        if(!editorc) {
            editorc = CodeMirror(edtRef, {
                mode: 'stex',
                lineNumbers: true,
                lineWrapping: true
            })
            editorc.setSize("100%", "calc(100vh - 73px)");
        }

        binding = new CodemirrorBinding(ytext, editorc, awareness);
        // // binding = new QuillBinding(ytext, edtRef.getEditor(), awareness);
        // return () => {
        
        //     if (provider) {
        //       provider.disconnect(); //We destroy doc we created and disconnect 
        //       ydoc.destroy();  //the provider to stop propagting changes if user leaves editor
        //     }
        // };

    }, [currentFile])
    
    // useEffect(() => {
    //     if (edtRef) return;
    //         quillRef = edtRef
    // })

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

    function onEditorChanged(e){
        setCurrentText(editorc.getValue());
        if(!modified) addUserToModified();
    }

    return ( 
        <div id='container'>
            {/* <ReactQuill 
                ref={(el) => { edtRef = el; }}
                theme="bubble"
                className="editor"
                modules={modules}
                formats={formats}
                value={value} 
                onChange={onEditorChanged}
                 /> */}
            <div id='editor' ref={(el) => { edtRef = el; }} onKeyUp={onEditorChanged}>

            </div>
        </div>
    )
}

export default Editor