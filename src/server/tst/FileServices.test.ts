import {describe, jest, expect, test} from '@jest/globals';
import request from "supertest"
import { FileUtil} from '../src/utils/FileUtil';
import {getPDF} from '../src/services/FileServices'
import fs from 'fs'

FileUtil.getFileData = jest.fn((file:String) => Buffer.from("123"))

describe('File Services', () => {

    test('example', () => {
      expect(1 + 2).toBe(3);
    });
    
    test('Test for getPDF', async () => {
        const req = { query: { file: 'test.tex' }  };
        const res = { 
            text: null,
            headers: {},
            send: function(input) { this.text = input.toString() },
            set: function(key, value) {this.headers.key = value}
        };
        await getPDF(req, res);
        expect(res.text).toBe("123");
    });
});