import React from 'react';

import { useEffect } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
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

var stompClient;

const modules = {
    cursors: true,
}

function Editor() {
    cons
    const [value, setValue] = useState('');
    const [EditorRef, setEditorRef] = useState(null);
    let edtRed = null;


    // Connect to socket when editor page is opened
    useEffect(() => {
        console.log(edtRed)
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider('wss://demos.yjs.dev', 'test1', ydoc);
        const ytext = ydoc.getText('quill');

        const awareness = provider.awareness; 
        
        const color = randomColor(); 
        
        awareness.setLocalStateField("user", {
          name: "Users Name",
          color: color,
        });
        new QuillBinding(ytext, edtRed.getEditor(), awareness);
    }, [])


    return ( 
        <div id='container'>
            <ReactQuill 
                ref={(el) => { edtRed = el; }}
                theme="snow"
                className="editor"
                modules={modules}
                value={value} 
                onChange={setValue} />
        </div>
    )
}

export default Editor