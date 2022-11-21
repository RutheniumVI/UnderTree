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

Quill.register('modules/cursors', QuillCursors);


const modules = {
    cursors: true,
}

function Editor() {
    const username = localStorage.getItem("username");
    const [value, setValue] = useState('');
    let edtRef = null;


    // Connect to socket when editor page is opened
    useEffect(() => {
        console.log(edtRef)
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider('wss://demos.yjs.dev', 'test1', ydoc);
        const ytext = ydoc.getText('quill');

        const awareness = provider.awareness; 
        
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: username,
          color: color,
        });
        new QuillBinding(ytext, edtRef.getEditor(), awareness);
    }, [])


    return ( 
        <div id='container'>
            <ReactQuill 
                ref={(el) => { edtRef = el; }}
                theme="snow"
                className="editor"
                modules={modules}
                value={value} 
                onChange={setValue} />
        </div>
    )
}

export default Editor