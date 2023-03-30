import { MongodbPersistence } from "y-mongodb-provider";
import dotenv from "dotenv";
import * as Y from "yjs";

dotenv.config();

const mdb = new MongodbPersistence(process.env.MONGODB_URI_D, {
	collectionName: "transactions",
	flushSize: 100,
	multipleCollections: false,
});

async function getDocumentData(documentId: string){
	const ydoc = await mdb.getYDoc(documentId);
	return ydoc.getText('quill').toString();
}

async function writeDocumentData(documentId: string, content: string){
	const ydoc = new Y.Doc();
	ydoc.getText('quill').insert(0, content);
	mdb.storeUpdate(documentId, Y.encodeStateAsUpdate(ydoc));
}

const PersistenceUtil = {
	mdb,
	getDocumentData,
	writeDocumentData
}

export { PersistenceUtil };