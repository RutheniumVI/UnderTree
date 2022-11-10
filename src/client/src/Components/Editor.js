import React from 'react';

import { useEffect } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient;

function Editor() {
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

    return <h2>Text Editor</h2>
}

export default Editor