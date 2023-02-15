import React from "react";
import io from "socket.io-client";
import { useState } from "react";
import { useEffect } from "react";
import "../Styles/NewChat.css";
import { v4 as uuidv4 } from "uuid";
import "./profile.PNG";
import axios from "axios";

const socket = io.connect("http://localhost:8001");

function NewChat() {
  const [userName, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [avatar, setAvatar] = useState("");

  //api calls
  const getAvatar = () => {
    axios
      .get("http://localhost:8000/api/chat/getAvatar", {
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

  const joinRoom = () => {
    if (userName !== "" && room !== "") {
      socket.emit("join_room", room); //room is sent as "data" in backend
      console.log(
        `User with socket ID ${socket.id} and username ${userName} joined the room`
      );
    }
  };

  const sendMessage = async () => {
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
          { message: messageContent },
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
  };

  useEffect(() => {
    console.log(socket);
    getAvatar();
    socket.on("receive_message", (data) => {
      //console.log("received" + data)
      setMessages((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div>
      <div className="form">
        <h3>Join a Chat</h3>
        <input
          type="text"
          placeholder="John.."
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="RoomID.."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <div>
          <button onClick={joinRoom}>CLICK ME</button>
        </div>
      </div>
      <div className="chat">
        <div className="header">
          <h3></h3>
        </div>
        <div className="body">
          {messages.map((messageData) => {
            if (userName == messageData.username) {
              return (
                <div class="row" id="my-message" key={messageData.id}>
                  <div class="col-3" />
                  <div class="col">
                    <p class="text-end">{messageData.username}</p>
                    <div class="card">
                      <div class="card-body">{messageData.message}</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <figure class="figure">
                      <img
                        src={avatar}
                        class="figure-img img-fluid rounded-circle"
                        alt="..."
                      />
                    </figure>
                  </div>
                </div>
              );
            } else
              return (
                <div class="row" id="your-message" key={messageData.id}>
                  <div class="col-3 text-end">
                    <figure class="figure">
                      <img
                        src={messageData.avatar}
                        class="figure-img img-fluid rounded-circle text-end"
                        alt="..."
                      />
                    </figure>
                  </div>
                  <div class="col">
                    <p>{messageData.username}</p>
                    <div class="card">
                      <div class="card-body">{messageData.message}</div>
                    </div>
                  </div>
                  <div class="col-3" />
                </div>
              );
          })}
        </div>
        <div
          className="footer"
          style={{ "padding-left": "10%", "padding-right": "10%" }}
        >
          <div class="input-group mb-3">
            <input
              class="form-control"
              id="message"
              type="text"
              placeholder="enter message"
              onChange={(event) => {
                setNewMessage(event.target.value);
              }}
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
    </div>
  );
}

export default NewChat;
