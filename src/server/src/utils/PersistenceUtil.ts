import { MongodbPersistence } from "y-mongodb-provider";
import dotenv from "dotenv";

dotenv.config();

const mdb = new MongodbPersistence(process.env.MONGODB_URI_D, {
	collectionName: "transactions",
	flushSize: 100,
	multipleCollections: true,
});

async function getDocumentData(documentId: String){
	const ydoc = await mdb.getYDoc(documentId);
	return ydoc.getText('quill').toString();
}

const PersistenceUtil = {
	mdb,
	getDocumentData
}

export { PersistenceUtil };