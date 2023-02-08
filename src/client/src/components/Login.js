import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

async function signIn() {  
  const urlParams = new URLSearchParams(window.location.search);
  let username = "";
  let token = urlParams.get('token');

  await axios.get("http://localhost:8000/api/auth/getUser", {
    withCredentials: true,
    }).then((res) => {
      console.log("Username: ", res.data);
      username = res.data
      localStorage.setItem('username', username);
      // window.location.reload();
    }).catch((error) => {
      console.error(`Error getting user from GitHub`);
    });
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