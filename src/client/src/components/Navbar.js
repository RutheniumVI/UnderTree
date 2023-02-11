import React from 'react';
import "../Styles/Navbar.css"

function Navbar() {
    return (
        <nav className="navbar navbar-dark bg-dark navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href="/projects">UnderTree</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto mb-2">
                    <li className="nav-item">
                    <a className="nav-link active mx-2" href="/projects">Projects</a>
                    </li>
                    <li className="nav-item mx-2">
                    <a className="nav-link" href="#">Help</a>
                    </li>
                </ul>
                <button type="button" className="btn btn-primary mx-2">Log out</button>
                </div>
            </div>

        </nav>
    );
}

export default Navbar;