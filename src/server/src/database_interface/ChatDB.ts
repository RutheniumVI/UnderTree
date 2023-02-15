import { Message } from '../data/ChatData.js';
import { DBClient } from '../utils/MongoDBUtil.js';

async function addMessage(message: Message): Promise<void> {
  let response = await DBClient.collectionExists("chat");
  if (!response) {
    await DBClient.createCollection("chat");
    // await DBClient.getCollection("chat").createIndex({ username: 1 }, { unique: true });
    console.log("Created chat collection");
  }

  try {
    await DBClient.getCollection("chat").insertOne(message);
  } catch (err) {
    console.log("error saving message: ", message);
    throw Error("Message could not be saved");
  }
}

async function getMessages(room: string): Promise<void> {
  try {
    let messages = await DBClient.getCollection("chat")
  }
}

const ChatDB = {
  addMessage,
}

export { ChatDB }