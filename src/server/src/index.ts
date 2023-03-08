import {server} from "./UnderTree";
import { FileUtil } from './utils/FileUtil';
import { DBClient } from './utils/MongoDBUtil';

import runChatServer from './services/ChatSocket.js';

main();

async function main(){
    await DBClient.connect();
    FileUtil.setUpFileSystem();
    console.log("Connected successfully to database");

    runChatServer();

    server.listen(8000, () => {
        console.log('listening on *8000');
    });
}