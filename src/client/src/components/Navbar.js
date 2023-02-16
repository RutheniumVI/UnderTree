import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';

import "../Styles/Navbar.css"

function Navbar() {

    useEffect(() => {
        handleLogIn();
    }, []);

    async function handleLogIn() {  
        let username = localStorage.getItem("username");
      
        if (username === null) {
            await axios.get(process.env.REACT_APP_API_URL+"/auth/getUsername", {
                withCredentials: true,
            }).then((res) => {
                console.log("Username: ", res.data);
                username = res.data
                localStorage.setItem('username', username);
                window.location.href = "/projects"
            }).catch((error) => {
                console.error(`Error getting user from GitHub`);
            });
        }
    }

    async function handleLogout() {
        await axios.get(process.env.REACT_APP_API_URL+"/auth/logout", {
        withCredentials: true,
        }).then((res) => {
            localStorage.removeItem('username');
            window.location.href = "/"
        }).catch((error) => {
            console.error(`Error logging user out from GitHub`);
        });
    }

    return (
        <nav className="navbar navbar-dark bg-dark navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href={localStorage.getItem("username") === null ? "/" : "/projects"}>UnderTree</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto mb-2">
                    {localStorage.getItem("username") !== null &&<li className="nav-item">
                    {   
                        window.location.pathname == "/projects" ?
                        <a className="nav-link active mx-2" href="/projects">Projects</a> :
                        <a className="nav-link mx-2" href="/projects">Projects</a>
                    }
                    </li>}
                    <li className="nav-item mx-2">
                    <a className="nav-link" href="#">Help</a>
                    </li>
                </ul>
                {localStorage.getItem("username") === null ? 
                    <a href={"https://github.com/login/oauth/authorize?scope=user%20repo%20admin:org&client_id="+process.env.REACT_APP_CLIENT_ID}>
                        <button type="button" className="btn btn-primary mx-2">Log In</button>
                    </a> 
                    : 
                    <button type="button" className="btn btn-primary mx-2" onClick={handleLogout}>Log Out</button>}
                </div>
            </div>

        </nav>
    );
}

export default Navbar;