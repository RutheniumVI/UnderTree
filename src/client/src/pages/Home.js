import React from 'react';
import Editor from '../components/Editor';
import Chat from './Chat';

function Home() {
  return (
    <div className='home-container' style={{display: 'flex', flexDirection: 'row'}}>
      <div style={{}}>
        <Editor/>
      </div>
      <Chat/>
    </div>
  );
}

export default Home