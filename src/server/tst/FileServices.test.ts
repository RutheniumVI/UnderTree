import {describe, jest, expect, test} from '@jest/globals';
import { FileUtil} from '../src/utils/FileUtil';
import {compilePDF, getPDF} from '../src/services/FileServices'

describe('File Services', () => {

    test('UT-10: Compile empty PDF', async () => {
        const req = {body: {documentId: "bob/Test/testFile.tex", text: ""}}
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

        await compilePDF(req, res);
        expect(res.text).not.toBe("Successfully compiled PDF");
    });

    test('UT-11: Compile valid PDF', async () => {
        const req = {body: {documentId: "bob/Test/testFile.tex", text: "\\documentclass{article}\n\\usepackage{graphicx} % Required for inserting images\n\\title{Test}\n\\author{Faiq Ahmed}\n\\date{February 2023}\n\\begin{document}\n\\maketitle\n\\section{Introduction}\n\\end{document}"}}
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

        await compilePDF(req, res);
        expect(res.text).toBe("Successfully compiled PDF");
    });

    test('UT-12: get PDF for file not compiled', async () => {
        const req = {query: {file: "john/test/main.tex"}}
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

        await getPDF(req, res);
        expect(res.text).toBe("%PDF-1.4\n%����\n1 0 obj\
        \n<</Title (Untitled document)\n/Producer (Skia/PDF m111 Google Docs Renderer)>>\
        \nendobj\n3 0 obj\n<</ca 1\n/BM /Normal>>\nendobj\n4 0 obj\n<</Length 84>> stream\
        \n1 0 0 -1 0 842 cm\nq\n.75 0 0 .75 0 0 cm\n1 1 1 RG 1 1 1 rg\n/G3 gs\n0 0 794 1123 re\
        \nf\nQ\n\nendstream\nendobj\n2 0 obj\n<</Type /Page\
        \n/Resources <</ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/ExtGState <</G3 3 0 R>>>>\
        \n/MediaBox [0 0 596 842]\n/Contents 4 0 R\n/StructParents 0\n/Parent 5 0 R>>\nendobj\
        \n5 0 obj\n<</Type /Pages\n/Count 1\n/Kids [2 0 R]>>\nendobj\n6 0 obj\n<</Type /Catalog\
        \n/Pages 5 0 R>>\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000015 00000 n\
        \n0000000277 00000 n\n0000000108 00000 n\n0000000145 00000 n\n0000000465 00000 n\
        \n0000000520 00000 n\ntrailer\n<</Size 7\n/Root 6 0 R\n/Info 1 0 R>>\nstartxref\
        \n567\n%%EOF");
    });

    test('UT-13: get PDF for file compiled', async () => {
        const req = {query: {file: "bob/Test/testFile.tex"}}
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

        await getPDF(req, res);
        expect(res.text).not.toBe("%PDF-1.4\n%����\n1 0 obj\
        \n<</Title (Untitled document)\n/Producer (Skia/PDF m111 Google Docs Renderer)>>\
        \nendobj\n3 0 obj\n<</ca 1\n/BM /Normal>>\nendobj\n4 0 obj\n<</Length 84>> stream\
        \n1 0 0 -1 0 842 cm\nq\n.75 0 0 .75 0 0 cm\n1 1 1 RG 1 1 1 rg\n/G3 gs\n0 0 794 1123 re\
        \nf\nQ\n\nendstream\nendobj\n2 0 obj\n<</Type /Page\
        \n/Resources <</ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/ExtGState <</G3 3 0 R>>>>\
        \n/MediaBox [0 0 596 842]\n/Contents 4 0 R\n/StructParents 0\n/Parent 5 0 R>>\nendobj\
        \n5 0 obj\n<</Type /Pages\n/Count 1\n/Kids [2 0 R]>>\nendobj\n6 0 obj\n<</Type /Catalog\
        \n/Pages 5 0 R>>\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000015 00000 n\
        \n0000000277 00000 n\n0000000108 00000 n\n0000000145 00000 n\n0000000465 00000 n\
        \n0000000520 00000 n\ntrailer\n<</Size 7\n/Root 6 0 R\n/Info 1 0 R>>\nstartxref\
        \n567\n%%EOF");
    });
});