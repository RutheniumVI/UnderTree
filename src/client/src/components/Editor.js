import React from 'react';

import { useEffect } from 'react';
import { useState } from 'react';
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'

import randomColor from 'randomcolor';

import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import 'react-quill/dist/quill.snow.css';
import '../Styles/Editor.css'
import "highlight.js/styles/github.css";
import hljs from 'highlight.js'
// import 'highlight.js/styles/default.css'

Quill.register('modules/cursors', QuillCursors);

hljs.configure({
    languages: ['tex', 'python', 'rust'],
})

const modules = {
    syntax: {
        highlight: text => hljs.highlightAuto(text).value,
    },
    cursors: true,
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

function Editor({documentID, setCurrentText}) {
    const username = localStorage.getItem("username");
    const [value, setValue] = useState('');
    const [modified, setModified] = useState(false);
    let edtRef = null;


    // Connect to socket when editor page is opened
    useEffect(() => {
        console.log(edtRef)
        const ydoc = new Y.Doc();   
        const provider = new WebsocketProvider('ws://localhost:8000', documentID, ydoc, {params: {jwt: "123"}});
        const ytext = ydoc.getText('quill');

        const awareness = provider.awareness; 
        
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: username,
          color: color,
        });

        new QuillBinding(ytext, edtRef.getEditor(), awareness);
    }, [])

    function onEditorChanged(content, delta, source, editor){
        setValue(content);
        setCurrentText(editor.getText(content));
        console.log(editor)
        if(!modified){
            console.log("I made first change");
            setModified(true);
        }
    }

    return ( 
        <div id='container'>
            <ReactQuill 
                ref={(el) => { edtRef = el; }}
                theme="snow"
                className="editor"
                modules={modules}
                formats={formats}
                value={value} 
                onChange={onEditorChanged}
                 />
        </div>
    )
}

export default Editor