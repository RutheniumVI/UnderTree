import React from 'react';
import Editor from '../components/Editor';
import LiveUsers from '../components/LiveUsers';
import Chat from './Chat';

function Home() {
  return (
    <div>
      <h2></h2>
      <LiveUsers/>
      <Editor/>
      <Chat/>
    </div>
  );
}

export default Home