/*
Author: Kevin Kannammalil
Date: March 23, 2023
Purpose: Login handler to allow users to log in using GitHub
*/

import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

async function signIn() {  
  let username = localStorage.getItem("username");

  // If the username is not stored in local storage, get it from the server`
  if (username === null) {
    await axios.get(process.env.REACT_APP_API_URL+"/auth/getUsername", {
      withCredentials: true,
      }).then((res) => {
        console.log("Username: ", res.data);
        username = res.data
        localStorage.setItem('username', username);
      }).catch((error) => {
        console.error(`Error getting user from GitHub`);
      });
  }
}

// This component is used to login with GitHub by redirecting to the GitHub OAuth page
function Login() {
  let location = useLocation();

  // Every time it renders, it will check if the user is already logged in
  React.useEffect(() => {
    signIn();
  }, [location]);

  return (
    <div> 
      <h2>Login</h2>
      <a href={"https://github.com/login/oauth/authorize?scope=user%20repo%20admin:org&client_id="+process.env.REACT_APP_CLIENT_ID}>
        <button>
          Login with GitHub
        </button>
      </a>
    </div>

  );
}

export default Login;