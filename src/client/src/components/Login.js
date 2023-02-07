import React from 'react';
import { useLocation } from 'react-router-dom';

function signIn() {
  console.log('signing in');
  
  const urlParams = new URLSearchParams(window.location.search);
  let username = urlParams.get('user');
  console.log(username);

  localStorage.setItem('username', username);
}

function Login() {
  let location = useLocation();

  React.useEffect(() => {
    signIn();
  }, [location]);

  const client_id = "79279cb46a338e30112e";
  return (
    <div> 
      <h2>Login</h2>
      <a href="https://github.com/login/oauth/authorize?scope=user&client_id=79279cb46a338e30112e">
        <button>
          Login with GitHub
        </button>
      </a>
    </div>

  );
}

export default Login;