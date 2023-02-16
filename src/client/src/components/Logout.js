import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

async function handleLogout() {
  console.log("Logging out");
  await axios.get(process.env.REACT_APP_API_URL+"/auth/logout", {
    withCredentials: true,
    }).then((res) => {
      localStorage.removeItem('username');
      window.location.reload();
    }).catch((error) => {
      console.error(`Error logging user out from GitHub`);
    });
}

function Logout() {
  return (
    <div> 
      <h2>Logout</h2>
      <button onClick={() => handleLogout()}>
        Logout
      </button>
    </div>

  );
}

export default Logout;