import { React, useState, useEffect } from 'react';
import { useLayoutEffect } from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import Chat from './Chat';
import Compiler from '../components/Compiler';
import Login from '../components/Login';
import Logout from '../components/Logout';
import Split from 'react-split'
import '../Styles/Home.css'
import CreateProject from '../components/CreateProject';
import Commit from '../components/Commit';
import Col from 'react-bootstrap/esm/Col';
import Collab from '../components/Collab';

function Home() {
  const [currentText, setCurrentText] = useState("");
  const [documentId, setdocumentID] = useState("owner/project/file");

  useLayoutEffect(() => {
      if(localStorage.getItem("username") !== null){
          window.location.href = "/projects"
      }
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
            <CreateProject/>
            <Commit/>
            <Collab/>
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