import { Message } from "../data/ChatData";
import { DBClient } from "../utils/MongoDBUtil";

async function addMessage(message: Message): Promise<void> {
	const response = await DBClient.collectionExists("chat");
	if (!response) {
		await DBClient.createCollection("chat");
		console.log("Created chat collection");
	}

	try {
		await DBClient.getCollection("chat").insertOne(message);
	} catch (err) {
		console.log("Error saving message: ", message);
		throw Error("Message could not be saved");
	}
}

async function getMessages(room: string): Promise<Array<Message>> {
	console.log("getting messages: ", room);
	let messages = [];
	try {
		messages = await DBClient.getCollection("chat").find({ room: room }, {projection:{_id:0}}).toArray();
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