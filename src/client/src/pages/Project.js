/*
Author: Faiq Ahmed
Date: March 28, 2023
Purpose: Project Module, allow users to access the editor, chat, file menu, and PDF renderer from the single page
*/

import React, { useLayoutEffect, useEffect } from 'react';
import { useState } from 'react';
import Split from 'react-split'
import FileMenu from '../components/FileMenu'
import Editor from '../components/Editor';
import Compiler from '../components/Compiler';
import Chat from '../components/Chat'
import DisplayImage from '../components/DisplayImage';
import "../Styles/Project.css"
import io from "socket.io-client";

let socket = null;

if (process.env.NODE_ENV == 'production') {
	socket = io.connect(process.env.REACT_APP_CHAT_URL, { path: '/chat/socket.io' });
} else {
	socket = io.connect(process.env.REACT_APP_CHAT_URL);
}

function Project() {
	const url = window.location.href;
	const sp = url.split("/")
	const [currentFile, setCurrentFile] = useState({
		fileName: "main.tex",
		filePath: sp[sp.length - 2] + "/" + sp[sp.length - 1] + "/" + "main.tex",
		fileType: "tex"
	});
	const [currentText, setCurrentText] = useState("");

	return (
		<div>
			<Split
				sizes={currentFile.fileType === "tex" ? [14, 43, 43] : [14, 86]}
				direction="horizontal"
				className="split"
			>
				<div className='sidebar'>
					<Split
						sizes={[50, 50]}
						direction="vertical"
						style={{ height: `calc(100vh - 5rem)` }}
					>
						<FileMenu currentFile={currentFile} setCurrentFile={setCurrentFile} />
						<Chat socket={socket} />
					</Split>
				</div>
				<div className='mainContainer'>
					{currentFile.fileType === "tex" || currentFile.fileType === "bib" ? <Editor className="editor" socket={socket} currentFile={currentFile} setCurrentText={setCurrentText} /> : <DisplayImage file={currentFile} />}
				</div>
				<div>
					{currentFile.fileType === "tex" && <Compiler className="compiler" documentID={currentFile.filePath} latexText={currentText} />}
				</div>
			</Split>
		</div>
	);
}

export default Project