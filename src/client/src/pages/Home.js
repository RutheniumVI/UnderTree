import { React, useState, useEffect } from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import Chat from './Chat';
import Compiler from '../components/Compiler';
import Login from '../components/Login';
import Logout from '../components/Logout';
import Split from 'react-split'
import '../Styles/Home.css'

function Home() {
  const [currentText, setCurrentText] = useState("");
  const [documentId, setdocumentID] = useState("owner/project/file");

  return (
    <div>
      <Split
          sizes={[14, 43, 43]} 
          direction="horizontal" 
          className="split"
      >
        <div className='sidebar'>

        </div>
        <Editor className="editor" documentID={documentId} setCurrentText={setCurrentText}/>
        <Compiler className="compiler" documentID={documentId} latexText={currentText}/>
      </Split>
      {/* <div class="container w-100 mw-100">
        <div class="row justify-content-start">
          <div class="col sidebar">

          </div>
          <div class="col">
            <LiveUsers/>
            <Editor/>
            <Chat/>
            <Login/>
            <Logout/>
          </div>
          <div class="col">
            <Compiler/>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Home