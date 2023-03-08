import {describe, jest, expect, test, beforeAll} from '@jest/globals';
import {addProject} from '../src/services/ProjectServices';
import { FileUtil } from '../src/utils/FileUtil';
import { DBClient } from '../src/utils/MongoDBUtil';


describe('Project Services', () => {

    beforeAll(async () => {
        await DBClient.connect();
        FileUtil.setUpFileSystem();
    });
    
    test('Test for getPDF', async () => {
        const req = {body: { projectName: "test", owner: "bob"}};
        const res = { 
            locals: {
                accessToken: "test",
                username: "bob"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };
        await addProject(req, res);
        expect(res.text).toBe("Successfully added project");
    });
});