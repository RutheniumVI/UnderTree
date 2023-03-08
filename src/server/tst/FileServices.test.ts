import {describe, expect, test} from '@jest/globals';
import app from "../src/UnderTree"
import request from "supertest"

describe('File Services', () => {
    test('adds 1 + 2 to equal 3', () => {
      expect(1 + 2).toBe(3);
    });
    test('responds to /hello/:name', async () => {
        const req = { params: { name: 'Bob' }  };
        const response = await request(app).get("/");
        // const res = { text: '',
        //     send: function(input) { this.text = input } 
        // };
        // hello(req, res);
        
        // expect(res.text).toEqual('hello Bob!');
        console.log(response)
    });
});