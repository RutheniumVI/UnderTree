/*
Author: Eesha Qureshi, Veerash Palanichamy
Date: March 20, 2023
Purpose: Chat Database Interface Module, responsible for making changes to database for the chat collection
*/

import { Message } from "../data/ChatData";
import { DBClient } from "../utils/MongoDBUtil";

const collectionName = "chat";

// Add a new message to the collection
async function addMessage(message: Message): Promise<void> {
	const response = await DBClient.collectionExists(collectionName);
	if (!response) {
		await DBClient.createCollection(collectionName);
		console.log("Created chat collection");
	}

	try {
		await DBClient.getCollection(collectionName).insertOne(message);
	} catch (err) {
		console.log("Error saving message: ", message);
		throw Error("Message could not be saved");
	}
}

// Get all messages from a specific room
async function getMessages(room: string): Promise<Array<Message>> {
	console.log("getting messages: ", room);
	let messages = [];
	try {
		messages = await DBClient.getCollection(collectionName).find({ room: room }, {projection:{_id:0}}).toArray();
	} catch (err) {
		throw "Messages could not be retrieved";
	}
	return messages;
}

const ChatDB = {
	addMessage,
	getMessages,
};

export { ChatDB };