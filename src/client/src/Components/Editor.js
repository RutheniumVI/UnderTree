import React from 'react';

import { useEffect } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../Styles/Editor.css'


var stompClient;

function Editor() {
    const [value, setValue] = useState('');

    // Connect to socket when editor page is opened
    useEffect(() => {
        let socket = new SockJS("http://localhost:8080/socket");
        stompClient = over(socket);
        stompClient.connect({}, onConnected, onError);
    })
    
    const onConnected = () => {
        console.log("connected");
        stompClient.subscribe("/editor/init", (payload) => {
        console.log(payload);
        })

        stompClient.send("/editor/trigger", {}, "hello");
    }

    const onError = (err) => {
        console.log(err);
    }

    return ( 
        <div className='container'>
            <ReactQuill className="editor" theme="snow" value={value} onChange={setValue} />
        </div>
    )
}

export default Editor