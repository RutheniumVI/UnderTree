import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

type collections = "projects" | "users" | "files"

var client;

async function connect() {
    const db = new MongoClient(process.env.MONGODB_URI);
    await db.connect();
    client = db.db("undertree")
    await client.command({ ping: 1 });
}

function createCollection(name: collections) {
    return client.createCollection(name);
}

function getCollection(name: collections){
    return client.collection(name);
}

function collectionExists(name: collections) {
    return client.listCollections({ name: name }).hasNext();
}

const DBClient = {
    connect,
    createCollection,
    getCollection,
    collectionExists
}

export { DBClient }