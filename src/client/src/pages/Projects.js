import React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

import '../Styles/Projects.css'

function Projects() {

    useEffect(() => {
        axios.get("http://localhost:8000/api/projects/getProjects", {withCredentials: true})
        .then((res) => {
            setProjects(res.data);
        })
    }, []);

    const [projects, setProjects] = useState([]);

    const [currentProject, setCurrentProject] = useState({
        "projectName": "",
        "owner": "",
        "collaborators": [],
        "isPrivate": false,
        "creationDate": ""
    })

    const [collaboratorValue, setCollaboratorValue] = useState("")

    const [errors, setErrors] = useState({
        "projectName":"",
        "collaborators": "",
        "addProject": "",
        "editProject": "",
        "deleteProject": ""
    })

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedProjectIndex, setSelectedProjectIndex] = useState();

    function resetModalStates(){
        setCurrentProject({
            "projectName": "",
            "owner": "",
            "collaborators": [],
            "isPrivate": false,
            "creationDate": ""
        });

        setErrors({
            "projectName":"",
            "collaborators": "",
            "addProject": "",
            "editProject": "",
            "deleteProject": ""
        });

        setCollaboratorValue("");
    }

    function updateCurrentProject(e){
        const value = e.target.value;
        setCurrentProject({...currentProject, projectName: value});
        if (value.split(" ").length != 1){
            setErrors({...errors, projectName: "GitHub repository name can not have spaces in it"});
        } else {
            setErrors({...errors, projectName: ""})
        }
    }

    function updateCollaboratorValue(e) {
        const value = e.target.value;
        setCollaboratorValue(value);
        if (value.split(" ").length != 1){
            setErrors({...errors, collaborators: "User name can not have spaces in it"});
        }
        else if (value === localStorage.getItem("username")){
            setErrors({...errors, collaborators: "Cannot add yourself as a collaborator"});
        }
        else {
            setErrors({...errors, collaborators: ""});
        }
    }

    function addProjectCollaborator(){
        if(collaboratorValue.length == 0){
            setErrors({...errors, collaborators: "User name can not be empty"});
        } else if (currentProject.collaborators.includes(collaboratorValue)){
            setErrors({...errors, collaborators: "User is already a collaborator in this repository"});
        } else if(errors.collaborators === ""){
            axios.get("http://localhost:8000/api/github/userExists",
                {params: {name: collaboratorValue}, withCredentials: true}
            ).then((res) => {
                if(!res.data){
                    setErrors({...errors, collaborators: "A user with the following name does not exist on GitHub"});
                } else {
                    setCollaboratorValue("");
                    setCurrentProject({...currentProject, collaborators: [...currentProject.collaborators, collaboratorValue]});
                }
            })
        }
    }

    function removeProjectCollaborator(collaborator){
        setCurrentProject({...currentProject, collaborators: currentProject.collaborators.filter((name) => {return name !== collaborator})})
    }

    function selectProject(index){
        resetModalStates();

        setCollaboratorValue("");

        setSelectedProjectIndex(index);
        setCurrentProject(projects[index]);
    }

    async function addProject(){
        if(currentProject.projectName === ""){
            setErrors({...errors, projectName: "GitHub repository name can not be empty"});
        } else if(errors.projectName === "" && errors.collaborators === ""){
            axios.get("http://localhost:8000/api/github/repositoryExists",
                {params: {name: currentProject.projectName, owner: localStorage.getItem("username")}, withCredentials: true}
            )
            .then((res) => {
                if(res.data){
                    setErrors({...errors, projectName: "Project with the following name already exists on GitHub"});
                } else {
                    const newProjectData = {
                        projectName: currentProject.projectName, 
                        owner: localStorage.getItem("username"), 
                        collaborators: currentProject.collaborators,
                        isPrivate: currentProject.isPrivate,
                        creationDate: new Date()
                    }
        
                    axios.post("http://localhost:8000/api/projects/addProject", newProjectData, {withCredentials: true})
                    .then((res) => {
                        setProjects([newProjectData, ...projects]);
                        document.getElementById('newProjectModalClose').click();
                    })
                    .catch((err) => {
                        if(err.response.status == 500){
                            setErrors({...errors, addProject: err.response.data});
                        }
                    });
                }
            })
        }
    }

    function editProject(){
        if(errors.collaborators === ""){
            axios.post("http://localhost:8000/api/projects/editProject", currentProject)
            .then((res) => {
                setProjects([...projects.slice(0, selectedProjectIndex), currentProject, ...projects.slice(selectedProjectIndex + 1)])
                document.getElementById('editProjectModalClose').click();
            })
            .catch((err) => {
                console.log(err)
                if(err.response.status == 500){
                    setErrors({...errors, editProject: err.response.data});
                }
            });
        }
    }

    function deleteProject(){
        axios.post("http://localhost:8000/api/projects/deleteProject", currentProject)
        .then((res) => {
            setProjects([...projects.slice(0, selectedProjectIndex), ...projects.slice(selectedProjectIndex + 1)])
            document.getElementById('deleteProjectModalClose').click();
        })
        .catch((err) => {
            if(err.response.status == 500){
                setErrors({...errors, editProject: err.response.data});
            }
        });
    }

    return (
        <div className='projectsPage'>
            <div className="container w-100 mw-100">
                <div className="row justify-content-start">
                    <div className="col">
                        <button type="button" className="btn btn-dark" onClick={resetModalStates} data-bs-toggle="modal" data-bs-target="#addProjectModal">New Project</button>
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#importProjectModal" style={{marginLeft: "15px"}}>Import Project</button>
                    </div>
                    <div className="col">
                        <input type="text" className="form-control float-end searchBar" placeholder='Search Projects ...' onChange={(e) => setSearchTerm(e.target.value)}></input>
                    </div>
                </div>
            </div>
            <div className="container projectsGrid mt-4">
                <div className="row justify-content-start projectLabels">
                    <div className="col-5 text-start">
                        Project Name
                    </div>
                    <div className="col">
                        Owner
                    </div>
                </div>
                <hr className='mainDivider'/>
                {projects.map((project, i) => {
                    if(searchTerm === "" || project.projectName.toLowerCase().startsWith(searchTerm.toLowerCase())){
                        return (
                            <div key={project.projectName}>
                                <div className="row justify-content-start projectInfo">
                                    <div className="col-5 text-start">
                                        {project.projectName}
                                    </div>
                                    <div className="col">
                                        {project.owner}
                                    </div>
                                    <div className="col">
                                        <div className='projectIcons float-end pr'>
                                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editProjectModal" icon={faPenToSquare} onClick={(e) => {selectProject(i)}}/>
                                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteProjectModal" style={{marginLeft: "15px"}} icon={faTrash} onClick={(e) => {selectProject(i)}}/>
                                        </div>
                                    </div>
                                </div>
                                <hr className='projectDivider'/>
                            </div>
                        )
                    }
                })}
            </div>
            <div className="modal fade" id="addProjectModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="addProjectModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="addProjectModalLabel">New Project</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='newProjectModalClose'></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Project Name:</label>
                            <input type="text" className="form-control" onChange={(e) => {updateCurrentProject(e)}} value={currentProject.projectName}/>
                            <div className="errorMessage">{errors.projectName}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Collaborators:</label>
                            <div className="row justify-content-start">
                                <div className="col-7">
                                    <input type="text" className="form-control" onChange={(e) => {updateCollaboratorValue(e)}} value={collaboratorValue}/>
                                    <div className="errorMessage">{errors.collaborators}</div>
                                </div>
                                <div className="col">
                                    <button type="button" className="btn btn-outline-dark" onClick={addProjectCollaborator}>Add Collaborator</button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-row ">
                            {currentProject.collaborators.map((collaborator) => 
                                <button key={collaborator} className='btn btn-outline-dark btn-sm collaboratorsList' onClick={(e) => {removeProjectCollaborator(collaborator)}}>{collaborator}</button>
                            )}
                        </div>
                        <div className="mb-3 form-check">
                            <input type="checkbox" className="form-check-input" checked={currentProject.isPrivate} onChange={(e) => {setCurrentProject({...currentProject, isPrivate: e.target.checked})}}/>
                            <label className="form-check-label">Make Repository Private</label>
                        </div>
                        <div className="errorMessage">{errors.addProject}</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-dark" onClick={addProject}>Create Project</button>
                    </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="editProjectModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="editProjectModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="editProjectModalLabel">Edit {currentProject.projectName}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='editProjectModalClose'></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Collaborators:</label>
                            <div className="row justify-content-start">
                                <div className="col-7">
                                    <input type="text" className="form-control" onChange={(e) => {updateCollaboratorValue(e)}} value={collaboratorValue}/>
                                    <div className="errorMessage">{errors.collaborators}</div>
                                </div>
                                <div className="col">
                                    <button type="button" className="btn btn-outline-dark" onClick={addProjectCollaborator}>Add Collaborator</button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-row ">
                            {currentProject.collaborators.map((collaborator) => 
                                <button key={collaborator} className='btn btn-outline-dark btn-sm collaboratorsList' onClick={(e) => {removeProjectCollaborator(collaborator)}}>{collaborator}</button>
                            )}
                        </div>
                        <div className="errorMessage">{errors.editProject}</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-dark" onClick={editProject}>Save Changes</button>
                    </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="deleteProjectModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="deleteProjectModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="deleteProjectModalLabel">Delete {currentProject.projectName}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='deleteProjectModalClose'></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you would like to delete this project? It will not be deleted from your GitHub repository</p>
                        <div className="errorMessage">{errors.deleteProject}</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-dark" onClick={deleteProject}>Confirm</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;