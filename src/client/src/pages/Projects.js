import React from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

import '../Styles/Projects.css'

function Projects() {
    const [projects, setProjects] = useState([{
        "name": "Project 1",
        "owner": "fahmed4030"
    }]);

    const [searchTerm, setSearchTerm] = useState("");

    async function addProject(){
        const response = await axios.post("http://localhost:8000/api/projects/addProject", {name: "test", owner: "test", collaborators: ["test"], creationDate: "test"});
        console.log(response);
    }

    return (
        <div className='projectsPage'>
            <div class="container w-100 mw-100">
                <div class="row justify-content-start">
                    <div class="col">
                        <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#projectModal" onClick={addProject}>New Project</button>
                    </div>
                    <div class="col">
                        <input type="text" class="form-control float-end searchBar" placeholder='Search Projects ...' onChange={(e) => setSearchTerm(e.target.value)}></input>
                    </div>
                </div>
            </div>
            <div class="container projectsGrid mt-4">
                <div class="row justify-content-start projectLabels">
                    <div class="col-5 text-start">
                        Project Name
                    </div>
                    <div class="col">
                        Owner
                    </div>
                </div>
                <hr className='mainDivider'/>
                {projects.map(project => {
                    if(searchTerm === "" || project.name.toLowerCase().startsWith(searchTerm.toLowerCase())){
                        return (
                            <div>
                                <div class="row justify-content-start projectInfo">
                                    <div class="col-5 text-start">
                                        {project.name}
                                    </div>
                                    <div class="col">
                                        {project.owner}
                                    </div>
                                    <div class="col">
                                        <div className='projectIcons float-end pr'>
                                            <FontAwesomeIcon icon={faPenToSquare}/>
                                            <FontAwesomeIcon style={{marginLeft: "15px"}} icon={faTrash}/>
                                        </div>
                                    </div>
                                </div>
                                <hr className='projectDivider'/>
                            </div>
                        )
                    }
                })}
            </div>
            <div class="modal fade" id="projectModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="projectModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="projectModalLabel">New Project</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-dark">Create Project</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;