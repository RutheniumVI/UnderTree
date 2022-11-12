import React from 'react';
import axios from 'axios';

function signIn() {
  console.log('signing in');
}

function Login() {
  const client_id = "79279cb46a338e30112e";
  const redirect_uri = "http://localhost:3000";
  return (
    <div> 
      <h2>Login</h2>
      <a href="https://github.com/login/oauth/authorize?scope=user&client_id=79279cb46a338e30112e">
        <button onClick={signIn}>
          Login with GitHub
        </button>
      </a>
    </div>

  );
}

export default Login