import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function signIn() {
  console.log('signing in');

  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');
  console.log(code);

  if (code) {
    axios.get('http://localhost:8080/github/code=' + code)
    .then((response) => {
      localStorage.setItem('username', response.data.username);
      console.log(localStorage.getItem('username'));
      })
    .catch((error) => {
      console.log(error);
    });
  }
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