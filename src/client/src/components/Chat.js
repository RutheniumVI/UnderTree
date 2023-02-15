import React from "react";
import io from "socket.io-client";
import { useState } from "react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useParams } from 'react-router-dom';

import "../Styles/Chat.css";

const socket = io.connect("http://localhost:8001");

function NewChat() {
  const { owner, projectName } = useParams();
  const userName = localStorage.getItem("username");
  const room = owner + "/" + projectName;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [avatar, setAvatar] = useState("");

  async function getMessages() {
    // if (localStorage.getItem("undertree-room") != null) {
    //   setRoom(localStorage.getItem("undertree-room"));
    // }
    console.log("Room Value: ", room);

    if (room != null) {
      await axios.get("http://localhost:8000/api/chat/getMessages?owner="+owner+"&projectName="+projectName, {
        params: { room: room },
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data["messages"]);
        setMessages(res.data["messages"]);
        // if (res.data != null) {
        //   setAvatar(res.data["avatar"]);
        // }
      })
      .catch((err) => {
        console.log(err);
      });
    }
  };

  //api calls
  async function getAvatar() {
    await axios.get("http://localhost:8000/api/chat/getAvatar", {
      withCredentials: true,
    })
    .then((res) => {
      console.log(res.data["avatar"]);
      if (res.data != null) {
        setAvatar(res.data["avatar"]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
    return;
  };

  async function sendMessage() {
    if (newMessage !== "") {
      const messageContent = {
        room: room,
        username: userName,
        message: newMessage,
        time: new Date(),
        avatar: avatar,
        id: uuidv4(),
      };

      await socket.emit("send_message", messageContent);

      await axios
        .post(
          "http://localhost:8000/api/chat/sendMessage",
          { message: messageContent, projectName: projectName, owner: owner },
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setNewMessage("");
  };

  async function setUpChat(){
    socket.emit("join_room", owner+"/"+projectName);
    await getAvatar();
    await getMessages()
    socket.on("receive_message", (data) => {
      //console.log("received" + data)
      setMessages((list) => [...list, data]);
    });
  }

  useEffect(() => {
    setUpChat()
  }, [socket]);

  return (
    <div className="chat">
        {messages.map((messageData) => {
          if (userName == messageData.username) {
            return (
              <div className="row" id="my-message" key={messageData.id}>
                <div className="col">
                  <p className="text-end">{messageData.username}</p>
                  <div className="d-flex justify-content-end">
                    <p className="text-end messageSent">{messageData.message}</p>
                  </div>
                </div>
                <div className="col imageCol">
                  <figure className="figure">
                    <img
                      src={avatar}
                      className="figure-img img-fluid rounded-circle profilePicture"
                      alt="..."
                    />
                  </figure>
                </div>
              </div>
            );
          } else
            return (
              <div className="row" id="your-message" key={messageData.id}>
                <div className="col imageCol">
                  <figure className="figure">
                      <img
                        src={avatar}
                        className="figure-img img-fluid rounded-circle profilePicture"
                        alt="..."
                      />
                  </figure>
                </div>
                <div className="col">
                  <p>{messageData.username}</p>
                  <div className="d-flex justify-content-start">
                    <p className="text-end messageReceived">{messageData.message}</p>
                  </div>
                </div>
              </div>
            );
        })}
        <div
          className="footer"
          style={{ paddingLeft: "5%", paddingRight: "5%" }}
        >
          <div className="input-group mb-3">
            <input
              className="form-control messageInput"
              type="text"
              placeholder="enter message"
            //   onKeyDown={(e) => {
            //     if(e.key === "Enter"){
            //         console.log("hello");
            //         sendMessage()
            //     }
            //   }}
              onChange={(event) => {
                setNewMessage(event.target.value);
              }}
              value={newMessage}
            />
            <button
              type="button"
              className="btn btn-dark tiny-btn"
              id="send-button"
              onClick={sendMessage}
            >
              Send
            </button>
        </div>
      </div>
    </div>
  );
}

export default NewChat;