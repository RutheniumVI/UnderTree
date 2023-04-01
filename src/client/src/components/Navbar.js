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
                    <a className="nav-link" data-bs-toggle="modal" data-bs-target="#helpModal" href="#">Help</a>
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

            <div className="modal fade" id="helpModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="helpModalLabel"><strong>FAQ</strong></h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='helpModalClose'></button>
                    </div>
                    <div className="modal-body">
                        <h5><strong>What is UnderTree?</strong></h5>
                        <p class="font-weight-light">UnderTree is a Latex Editor integrated heavily with GitHub that allows you to manage your projects and collaborate with your team members.</p>
                        <h5><strong>How do I get started?</strong></h5>
                        <p class="font-weight-light">To get started, simply log in with your GitHub account. You will be redirected to the projects page where you can create a new project or import an existing one.</p>
                        <h5><strong>How do I remove collaborators from my project?</strong></h5>
                        <p class="font-weight-light">To remove collaborators from your project, click on the edit button on the project page. You can click on the collaborator you want to remove and then press "Save Changes".</p>
                        <h5><strong>If I delete the project on UnderTree, will it delete the repository in the GitHub too?</strong></h5>
                        <p class="font-weight-light">No, deleting the project on UnderTree will not delete the repository in the GitHub</p>
                        <h5><strong>Will there be GitLab support as well?</strong></h5>
                        <p class="font-weight-light">Yes, we are planning to add GitLab support in the future!</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
            </div>

        </nav>
    );
}

export default Navbar;