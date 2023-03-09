import {describe, jest, expect, test, beforeAll} from '@jest/globals';
import { ProjectData } from '../src/data/ProjectData';
import { GitHubFiles, GitHubFileContent } from '../src/data/GitHubData';
import { ProjectDB } from '../src/database_interface/ProjectDB';
import {addProject, deleteProject, editProject, getProjects, importProjects} from '../src/services/ProjectServices';
import { FileUtil } from '../src/utils/FileUtil';
import { GitHubUtil } from '../src/utils/GitHubUtil';
import { DBClient } from '../src/utils/MongoDBUtil';
import { FileDB } from '../src/database_interface/FileDB';

GitHubUtil.createProject = jest.fn((project, accessToken) => {return new Promise<string>((resolve, reject) => {
    resolve("success");
})})

GitHubUtil.addCollabsToRepo = jest.fn((project, accessToken, collaborators) => {return new Promise<string>((resolve, reject) => {
    resolve("success");
})})

GitHubUtil.removeCollabsFromRepo = jest.fn((project, accessToken, collaborators) => {return new Promise<string>((resolve, reject) => {
    resolve("success");
})})

GitHubUtil.getRepoCollaborators = jest.fn((accessToken, project) => {return new Promise<ProjectData>((resolve, reject) => {
    resolve({projectName: "test", owner: "bob"});
})})

GitHubUtil.getRepoContent = jest.fn((accessToken, project) => {return new Promise<GitHubFiles>((resolve, reject) => {
    resolve({texFiles: [{name: "main.tex", path: "test", sha: "test", url: "test"}], imageFiles: []});
})})

GitHubUtil.getContentFromBlob = jest.fn((accessToken, project, file) => {return new Promise<GitHubFileContent>((resolve, reject) => {
    resolve({content: "test file", encoding: "utf-8"});
})})

describe('Project Services', () => {

    beforeAll(async () => {
        await DBClient.connect();
        FileUtil.setUpFileSystem();
    });
    
    test('UT-1: Create project without collaborators', async () => {
        const req = {body: { projectName: "test", owner: "bob", collaborators: []}};
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
        await deleteProject(req, res);
        await addProject(req, res);
        expect(res.text).toBe("Successfully added project");

        let project = await ProjectDB.getProject("test", "bob");
        expect(project.projectName).toBe("test");
        expect(project.owner).toBe("bob");
        await deleteProject(req, res);
    });

    test('UT-2: Create project with collaborators', async () => {
        const req = {body: { projectName: "test2", owner: "bob2", collaborators: ["fahmed8383"]}};
        const res = { 
            locals: {
                accessToken: "test",
                username: "bob2"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };
        await deleteProject(req, res);
        await addProject(req, res);
        expect(res.text).toBe("Successfully added project");
        let project = await ProjectDB.getProject("test2", "bob2");
        expect(project.projectName).toBe("test2");
        expect(project.owner).toBe("bob2");
        expect(project.collaborators?.toString()).toBe("fahmed8383");
        await deleteProject(req, res);
    });

    test('UT-3: Create existing project', async () => {
        const req = {body: { projectName: "test3", owner: "bob3", collaborators: ["fahmed8383"]}};
        const res = { 
            locals: {
                accessToken: "test",
                username: "bob3"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };
        await deleteProject(req, res);
        await addProject(req, res);
        await addProject(req, res);
        expect(res.text).toBe("Failed to create project and add collaborators");
        await deleteProject(req, res);
    });

    test('UT-5: Delete project', async () => {
        const req = {body: { projectName: "test5", owner: "bob5", collaborators: []}};
        const res = { 
            locals: {
                accessToken: "test",
                username: "bob5"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };
        await deleteProject(req, res);

        expect(res.text).toBe("File system corresponding to the project has already been deleted");
    });

    test('UT-6: Delete project that does not exist', async () => {
        const req = {body: { projectName: "test6", owner: "bob", collaborators: []}};
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

        await deleteProject(req, res)

        expect(res.text).toBe("File system corresponding to the project has already been deleted");
    });

    test('UT-7: Get all projects user is a part of', async () => {
        const req1 = {body: { projectName: "test7", owner: "joe"}};
        const res1 = { 
            locals: {
                accessToken: "test",
                username: "joe"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };

        await addProject(req1, res1);

        const req2 = {body: { projectName: "test7_2", owner: "a", collaborators: ["joe"]}};
        const res2 = { 
            locals: {
                accessToken: "test",
                username: "a"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };

        await addProject(req2, res2);

        const req3 = {body: { projectName: "test7_3", owner: "a"}};
        const res3 = { 
            locals: {
                accessToken: "test",
                username: "a"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };

        await addProject(req3, res3);

        const req = {};
        const res = { 
            locals: {
                accessToken: "test",
                username: "joe"
            },
            text: null,
            statusText: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value},
            status: function(input) {this.statusText = input; return this},
            json: function(input) {this.text = input}

        };

        await getProjects(req, res);

        expect(res.text).toStrictEqual([{"owner": "joe", "projectName": "test7"}, {"collaborators": ["joe"], "owner": "a", "projectName": "test7_2"}]);
        
        await deleteProject(req1, res1)
        await deleteProject(req2, res2)
        await deleteProject(req3, res3)
    });

    test('UT-8: Add collaborator to project', async () => {
        const req = {body: { projectName: "test8", owner: "bob", collaborators: []}};
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

        const req2 = {body: { projectName: "test8", owner: "bob", collaborators: ["john"]}};
        await addProject(req, res);
        await editProject(req2, res);

        let project = await ProjectDB.getProject("test8", "bob");
        expect(project.collaborators).toStrictEqual(["john"]);
        await deleteProject(req, res);
    });

    test('UT-9: Remove collab from project', async () => {
        const req = {body: { projectName: "test9", owner: "bob", collaborators: ["john"]}};
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

        const req2 = {body: { projectName: "test9", owner: "bob", collaborators: []}};
        await addProject(req, res);
        await editProject(req2, res);

        let project = await ProjectDB.getProject("test9", "bob");
        expect(project.collaborators).toStrictEqual([]);
        await deleteProject(req, res);
    });
});