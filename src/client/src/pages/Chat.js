import React from 'react';
import '../Styles/Chat.css';
import {useState, useEffect, useRef} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient;

function Chat() {
    const username = localStorage.getItem("username");
    const [newMessage, setNewMessage] = useState();
    const [messages, setMessages] = useState([]);
    const inputField = useRef();

    const sendMessage = (message) => {
        let msg = {"user": username, "message": message}
        stompClient.send("/chat/send", {}, JSON.stringify(msg));
    }

    const receiveMessage = (message) => {
        setMessages(messages => [...messages, JSON.parse(message.body)]);
    }

    useEffect(() => {
        let socket = new WebSocket('ws://localhost:8000');
        socket.addEventListener('open', (event) => {
            console.log("opened")
            socket.send('Hello Server!');
        });
    }, [])

    const onConnected = () => {
        console.log("connected");
        stompClient.subscribe("/chat/receive", (payload) => {
            receiveMessage(payload);
        })
    }

    const onError = (err) => {
        console.log(err);
    }

    const submitClicked = () => {
        sendMessage(newMessage);
        inputField.current.value = "";
    }

    return (
        <div className='container'>
            <div className='messages-container'>
                {messages.map((item, index) => {
                    if (item.user == username) {
                        return <p className='person1' key={index}>{item.message}</p>;
                    }
                        return <p className='person2' key={index}>{item.message}</p>;
                })}
            </div>
            <div className='write-message-container'>
                <Form id="new-message-form">
                    <Form.Group className="flex">
                        <Form.Label></Form.Label>
                        <Form.Control id="newtext" ref={inputField} type="textarea" placeholder="new message" onChange={(e) => setNewMessage(e.target.value)}/>
                        <Button id="submit" variant="primary" onClick={submitClicked}>
                            Send
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        </div>
    )
}

export default Chat