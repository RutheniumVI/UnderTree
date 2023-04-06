/*
Author: Faiq Ahmed
Date: February 10, 2023
Purpose: Mongo Database Util Module, contains the utility functions for all database related functionality that are used throughout the project
*/

import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

type collections = "projects" | "users" | "files"

let client;

// Set up and connect to the MongoDB database
async function connect() {
	const db = new MongoClient(process.env.MONGODB_URI);
	await db.connect();
	client = db.db("undertree");
	await client.command({ ping: 1 });
}

function createCollection(name: string) {
	return client.createCollection(name);
}

function getCollection(name: string){
	return client.collection(name);
}

function collectionExists(name: string) {
	return client.listCollections({ name: name }).hasNext();
}

const DBClient = {
	connect,
	createCollection,
	getCollection,
	collectionExists
};

export { DBClient };