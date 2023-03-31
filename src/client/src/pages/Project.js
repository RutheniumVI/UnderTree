import React, { useLayoutEffect, useEffect } from 'react';
import { useState } from 'react';
import Split from 'react-split'
import FileMenu from '../components/FileMenu'
import Editor from '../components/Editor2';
import Compiler from '../components/Compiler';
import Chat from '../components/Chat'
import DisplayImage from '../components/DisplayImage';
import "../Styles/Project.css"
import axios from 'axios';

function Project() {
  const url  = window.location.href;
  const sp = url.split("/")
  const [currentFile, setCurrentFile] = useState({
    fileName: "main.tex",
    filePath: sp[sp.length-2] + "/" + sp[sp.length-1] + "/" + "main.tex",
    fileType: "tex"
  });
  const [currentText, setCurrentText] = useState("");

  return (
    <div>
      <Split
          sizes={currentFile.fileType === "tex" ? [14, 43, 43]: [14, 86]} 
          direction="horizontal" 
          className="split"
      >
        <div className='sidebar'>
          <FileMenu currentFile={currentFile} setCurrentFile={setCurrentFile}/>
          <Chat/>
        </div>
        <div className='mainContainer'>
          {currentFile.fileType === "tex" || currentFile.fileType === "bib" ? <Editor className="editor" currentFile={currentFile} setCurrentText={setCurrentText}/> : <DisplayImage file={currentFile}/>}
        </div>
          {currentFile.fileType === "tex" && <Compiler className="compiler" documentID={currentFile.filePath} latexText={currentText}/>}
      </Split>
    </div>
  );
}

export default Project