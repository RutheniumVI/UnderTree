import React from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import Chat from './Chat';
import Compiler from '../components/Compiler';

function Home() {
  return (
    <div>
      <h2></h2>
      <div class="container w-100 mw-100">
        <div class="row justify-content-start">
          <div class="col">
            <LiveUsers/>
            <Editor/>
            <Chat/>
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