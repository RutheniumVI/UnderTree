import React from 'react';

function signIn() {
  console.log('signing in');
  window.open("http://localhost:5000/auth/github", "_self");
}

function Login() {
  return (
    <div> 
      <h2>Login</h2>
      <a href="https://google.com" rel="noreferrer">
        <button onClick={signIn}>
          Login with GitHub
        </button>
      </a>
    </div>

  );
}

export default Login