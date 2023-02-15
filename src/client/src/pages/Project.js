import React from 'react';
import { useState } from 'react';
import Split from 'react-split'
import FileMenu from '../components/FileMenu'
import Editor from '../components/Editor';
import Compiler from '../components/Compiler';


import axios from 'axios';

function Project() {
  const [currentFile, setCurrentFile] = useState("owner/project/file.tex");
  const [currentText, setCurrentText] = useState("");

  return (
    <div>
      <Split
          sizes={[14, 43, 43]} 
          direction="horizontal" 
          className="split"
      >
        <div className='sidebar'>
        <FileMenu></FileMenu>
        </div>
        <Editor className="editor" documentID={currentFile} setCurrentText={setCurrentText}/>
        <Compiler className="compiler" documentID={currentFile} latexText={currentText}/>
      </Split>
    </div>
  );
}

export default Project