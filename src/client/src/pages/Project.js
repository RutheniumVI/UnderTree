import React from 'react';
import { useState } from 'react';
import Split from 'react-split'
import FileMenu from '../components/FileMenu'
import Editor from '../components/Editor';
import Compiler from '../components/Compiler';
import Chat from '../components/Chat'
import DisplayImage from '../components/DisplayImage';
import axios from 'axios';

function Project() {
  const [currentFile, setCurrentFile] = useState({fileName: "default", filePath: "owner/project/file.tex", fileType: "tex"});
  const [currentText, setCurrentText] = useState("");

  return (
    <div>
      <Split
          sizes={[14, 43, 43]} 
          direction="horizontal" 
          className="split"
      >
        <div className='sidebar'>
          <FileMenu currentFile={currentFile} setCurrentFile={setCurrentFile}/>
          <Chat/>
        </div>
          {currentFile.fileType === "tex" ? <Editor className="editor" documentID={currentFile.filePath} setCurrentText={setCurrentText}/> : <DisplayImage/>}
          <Compiler className="compiler" documentID={currentFile.filePath} latexText={currentText}/>
      </Split>
    </div>
  );
}

export default Project