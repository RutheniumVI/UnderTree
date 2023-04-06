/*
Author: Veerash Palanichamy
Date: February 15, 2023
Purpose: Persistence Util Module, contains the utility functions for all persistence related functionality that are used throughout the project
*/

import { MongodbPersistence } from "y-mongodb-provider";
import dotenv from "dotenv";
import * as Y from "yjs";

dotenv.config();

const mdb = new MongodbPersistence(process.env.MONGODB_URI_D, {
	collectionName: "transactions",
	flushSize: 100,
	multipleCollections: false,
});

// Function that is used to retrieve the content of a document from the database
async function getDocumentData(documentId: string){
	const ydoc = await mdb.getYDoc(documentId);
	return ydoc.getText("quill").toString();
}

// Function that is used to persist the content of a document to the database
async function writeDocumentData(documentId: string, content: string){
	const ydoc = new Y.Doc();
	ydoc.getText("quill").insert(0, content);
	mdb.storeUpdate(documentId, Y.encodeStateAsUpdate(ydoc));
}

const PersistenceUtil = {
	mdb,
	getDocumentData,
	writeDocumentData
};

export { PersistenceUtil };