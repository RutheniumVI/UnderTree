import React from 'react';
import { useLayoutEffect, useState } from 'react';
import Split from 'react-split'
import Editor from '../components/Editor';
import Compiler from '../components/Compiler';


import axios from 'axios';

function Project() {
  const [currentFile, setCurrentFile] = useState("owner/project/file.tex");
  const [currentText, setCurrentText] = useState("");
  

  // basic api used to log out user is token is invalid
  useLayoutEffect(() => {
    axios.get("http://localhost:8000/api/projects/getProjects", {withCredentials: true})
    .catch((err) => {
        if(err.response.status == 401){
            localStorage.removeItem("username");
            window.location.href="/"
        }
    })
  }, []);

  return (
    <div>
      <Split
          sizes={[14, 43, 43]} 
          direction="horizontal" 
          className="split"
      >
        <div className='sidebar'>

        </div>
        <Editor className="editor" documentID={currentFile} setCurrentText={setCurrentText}/>
        <Compiler className="compiler" documentID={currentFile} latexText={currentText}/>
      </Split>
    </div>
  );
}

export default Project