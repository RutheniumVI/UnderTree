import http from "http";
import {WebSocketServer } from "ws";
import * as Y from "yjs";
import { MongodbPersistence } from "y-mongodb-provider";
import yUtils from "y-websocket/bin/utils";

const MongoDBURI = "mongodb://127.0.0.1:27017";
const port = 8080;

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('okay');
});

// y-websocket
const wss = new WebSocketServer({ server });
wss.on('connection', yUtils.setupWSConnection);

/*
 * y-mongodb-provider
 *  with all possible options (see API section below)
 */
const mdb = new MongodbPersistence(MongoDBURI, {
	collectionName: "transactions",
	flushSize: 100,
	multipleCollections: false,
});

/*
 Persistence must have the following signature:
{ bindState: function(string,WSSharedDoc):void, writeState:function(string,WSSharedDoc):Promise }
*/
yUtils.setPersistence({
  bindState: async (docName, ydoc) => {

    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates)
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    ydoc.on('update', async (update, origin) => {
      // console.log(origin);
      mdb.storeUpdate(docName, update);
    })
    console.log(ydoc.clientID);
  },
  writeState: async (docName, ydoc) => {
    return new Promise(resolve => {
      resolve()
    })
  }
})

server.listen(port, () => {
	console.log("listening on port:" + port);
});