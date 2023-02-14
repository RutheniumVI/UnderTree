import React from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import Chat from './Chat';
import Compiler from '../components/Compiler';
import Login from '../components/Login';
import Logout from '../components/Logout';
import CreateProject from '../components/CreateProject';
import Commit from '../components/Commit';
import Collab from '../components/Collab';

function Dev() {
  return (
    <div>
      <h2></h2>
      <div class="container w-100 mw-100">
        <div class="row justify-content-start">
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
      </div>
    </div>
  );
}

export default Dev