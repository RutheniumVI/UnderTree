import React from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import NewChat from './NewChat';
import Compiler from '../components/Compiler';
import Login from '../components/Login';
import Logout from '../components/Logout';
import CreateProject from '../components/CreateProject';

function Home() {
  return (
    <div>
      <h2></h2>
      <div class="container w-100 mw-100">
        <div class="row justify-content-start">
          <div class="col">
            <NewChat/>
          </div>
          <div class="col">
            <Compiler/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home