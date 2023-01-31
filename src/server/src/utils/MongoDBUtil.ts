import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

type collections = "projects" | "users"

var client;

async function connect() {
    const db = new MongoClient(process.env.MONGODB_URI);
    await db.connect();
    client = db.db("undertree")
    await client.command({ ping: 1 });
}

function getCollection(name: collections){
    return client.collection(name);
}

const DBClient = {
    connect,
    getCollection
}

export { DBClient }