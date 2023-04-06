/*
Author: Eesha Qureshi
Date: March 10, 2023
Purpose: Chat Module for displaying the chat data on the frontend and interacting with the backend
*/

import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useParams } from 'react-router-dom';

import "../Styles/Chat.css";

function NewChat({ socket }) {
	const { owner, projectName } = useParams();
	const userName = localStorage.getItem("username");
	const room = owner + "/" + projectName;
	const [newMessage, setNewMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [avatar, setAvatar] = useState("");

	// Get all messages for the room from the backend
	async function getMessages() {
		// }
		console.log("Room Value: ", room);

		if (room != null) {
			await axios.get(process.env.REACT_APP_API_URL + "/chat/getMessages?owner=" + owner + "&projectName=" + projectName, {
				params: { room: room },
				withCredentials: true,
			})
				.then((res) => {
					console.log(res.data["messages"]);
					setMessages(res.data["messages"]);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	// Get user profile picture from the backend
	async function getAvatar() {
		await axios.get(process.env.REACT_APP_API_URL + "/chat/getAvatar?owner=" + owner + "&projectName=" + projectName, {
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

	// Send message to be stored in the backend and to all other users in the chat room
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

			setNewMessage("");

			await socket.emit("send_message", messageContent);

			await axios
				.post(
					process.env.REACT_APP_API_URL + "/chat/sendMessage",
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
	};

	// Initialize chat when the page first loads
	async function setUpChat() {
		socket.emit("join_room", owner + "/" + projectName);
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
		<div className="chat" style={{ paddingBottom: '0' }}>
			<div className="chatChild" style={{ minHeight: '85%' }}>
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
											src={messageData.avatar}
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
			</div>
			<div
				className="footer"
				style={{ paddingLeft: "5%", paddingRight: "5%", marginBottom: '0' }}
			>
				<div className="input-group mb-3">
					<input
						className="form-control messageInput"
						type="text"
						placeholder="enter message"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								sendMessage()
							}
						}}
						onChange={(event) => {
							setNewMessage(event.target.value);
						}}
						value={newMessage}
					/>
					<button
						type="button"
						className="btn btn-dark tiny-btn"
						id="send-button"
						onClick={() => sendMessage()}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}

export default NewChat;