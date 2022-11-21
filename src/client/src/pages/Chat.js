import React from 'react';
import './Styles/Chat.css';
import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Chat() {
    const [uuid, setUuid] = useState(4)
    const [currentUser, setCurrentUser] = useState("person1")
    const [newMessage, setNewMessage] = useState();
    const [messages, setMessages] = useState([
        {"id": 1, 
         "person": "1",
         "messageContent": "hi",
         "timestamp": ""},
        {"id": 2, 
        "person": "2",
        "messageContent": "hello",
        "timestamp": ""},
        {"id": 3, 
        "person": "2",
        "messageContent": "hello",
        "timestamp": ""}
    ]);    
      //return <ul>{renderAnimals}</ul>;
    const sendMessage = (message) => {
        message = {
         "id": uuid, 
         "person": "1",
         "messageContent": message,
         "timestamp": ""
        }
        setUuid(uuid + 1);
        setMessages(messages.concat(message))
        //setNewMessage();
        console.log(messages)
        console.log(newMessage)
    }

  return (
    <div className='container'>
        <div className='messages-container'>
            {/*<p className='person1'>test tes te ste ste stestes et ste ste ste ste st ste st</p>
            <p className='person2'>testsetstststsets setsets tsteests stests</p>
    <p className='person1'>test tes te ste ste stestes et ste ste ste ste st ste st</p>*/}
            {messages.map((item, index) => {
            if (item.person == 1) {
            return <p className='person1' key={item.id}>{item.messageContent}</p>;
            }
            return <p className='person2' key={item.id}>{item.messageContent}</p>;
            })}
        </div>
        <div className='write-message-container'>
            <Form>
                <Form.Group className="mb-3" controlId="newMessage">
                    <Form.Label></Form.Label>
                    <Form.Control type="textarea" placeholder="new message" onChange={(e) => setNewMessage(e.target.value)} />
                </Form.Group>
                <Button variant="primary" onClick={()=>sendMessage(newMessage)}>
                    Submit
                </Button>
            </Form>
        </div>
    </div>
  )
}

export default Chat