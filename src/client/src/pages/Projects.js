/*
Author: Faiq Ahmed
Date: March 20, 2023
Purpose: Projects, New Project, Create Project, and Import Project Modules responsible for rendering all data related to project creation 
and listing and allow users to update the projects they have by interacting with the backend.
*/

import React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

import '../Styles/Projects.css'

function Projects() {

    // Get a list of all projects on page load
    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + "/projects/getProjects", { withCredentials: true })
            .then((res) => {
                setProjects(res.data);
            })
            .catch((err) => {
                if (err.response.status == 401) {
                    localStorage.removeItem("username");
                    window.location.href = "/"
                }
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

    const [importProjects, setImportProjects] = useState([]);
    const [selectedImportProjects, setSelectedImportProjects] = useState([]);

    const [collaboratorValue, setCollaboratorValue] = useState("")

    const [errors, setErrors] = useState({
        "projectName": "",
        "collaborators": "",
        "addProject": "",
        "editProject": "",
        "deleteProject": "",
        "importProjects": ""
    })

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedProjectIndex, setSelectedProjectIndex] = useState();

    // Reset the state of all modals back to default once a modal is closed so old information does not persist after its opened again
    function resetModalStates() {
        setCurrentProject({
            "projectName": "",
            "owner": "",
            "collaborators": [],
            "isPrivate": false,
            "creationDate": ""
        });

        setSelectedImportProjects([])

        setErrors({
            "projectName": "",
            "collaborators": "",
            "addProject": "",
            "editProject": "",
            "deleteProject": "",
            "importProjects": ""
        });

        setCollaboratorValue("");
    }

    // Update information about the current project that the user is updating and handle all errors associated with it
    function updateCurrentProject(e) {
        const value = e.target.value;
        setCurrentProject({ ...currentProject, projectName: value });
        if (value.split(" ").length != 1) {
            setErrors({ ...errors, projectName: "GitHub repository name cannot have spaces in it" });
        } else {
            setErrors({ ...errors, projectName: "" })
        }
    }

    // Update the current collaborator value and handle all errors associated with it
    function updateCollaboratorValue(e) {
        const value = e.target.value;
        setCollaboratorValue(value);
        if (value.split(" ").length != 1) {
            setErrors({ ...errors, collaborators: "User name cannot have spaces in it" });
        }
        else if (value === localStorage.getItem("username")) {
            setErrors({ ...errors, collaborators: "Cannot add yourself as a collaborator" });
        }
        else {
            setErrors({ ...errors, collaborators: "" });
        }
    }

    // Add collaborator to the list of collaborators for the project and handle all errors
    function addProjectCollaborator() {
        if (collaboratorValue.length == 0) {
            setErrors({ ...errors, collaborators: "User name cannot be empty" });
        } else if (currentProject.collaborators.includes(collaboratorValue)) {
            setErrors({ ...errors, collaborators: "User is already a collaborator in this repository" });
        } else if (errors.collaborators === "") {
            axios.get(process.env.REACT_APP_API_URL + "/github/userExists",
                { params: { name: collaboratorValue }, withCredentials: true }
            ).then((res) => {
                if (!res.data) {
                    setErrors({ ...errors, collaborators: "A user with the following name does not exist on GitHub" });
                } else {
                    setCollaboratorValue("");
                    setCurrentProject({ ...currentProject, collaborators: [...currentProject.collaborators, collaboratorValue] });
                }
            })
        }
    }

    // Remove specified collaborator from the list of collaborators of the project
    function removeProjectCollaborator(collaborator) {
        setCurrentProject({ ...currentProject, collaborators: currentProject.collaborators.filter((name) => { return name !== collaborator }) })
    }

    // Set the current project to make changes to be the project the user selected
    function selectProject(index) {
        resetModalStates();

        setCollaboratorValue("");

        setSelectedProjectIndex(index);
        setCurrentProject(projects[index]);
    }

    // Get a list of all the projects the user can import
    async function getImportProjects() {
        resetModalStates();

        await axios.get(process.env.REACT_APP_API_URL + "/github/getUserReposList", { withCredentials: true })
            .then((res) => {
                const filteredProjects = res.data.filter((importProject) => {
                    for (let i = 0; i < projects.length; i++) {
                        if (projects[i].projectName === importProject.projectName && projects[i].owner === importProject.owner) {
                            return false;
                        }
                    }
                    return true;
                })
                setImportProjects(filteredProjects);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    // Allow user to select a current project to be marked so they can import it when they confirmed
    function clickImportProject(i) {
        if (selectedImportProjects.includes(i)) {
            setSelectedImportProjects(selectedImportProjects.filter((index) => { return index !== i }))
        } else {
            setSelectedImportProjects([...selectedImportProjects, i]);
        }
    }

    // Import all projects marked to be imported
    async function confirmImportedProjects() {
        let currProjects = [];
        selectedImportProjects.forEach((i) => {
            currProjects.push(importProjects[i]);
        })
        if (currProjects.length != 0) {
            await axios.post(process.env.REACT_APP_API_URL + "/projects/importProjects", currProjects, { withCredentials: true })
                .then((res) => {
                    axios.get(process.env.REACT_APP_API_URL + "/projects/getProjects", { withCredentials: true })
                        .then((res) => {
                            setProjects(res.data);
                            document.getElementById('importProjectModalClose').click();
                        })
                        .catch((err) => {
                            if (err.response.status == 401) {
                                localStorage.removeItem("username");
                                window.location.href = "/"
                            }
                        })
                })
                .catch((err) => {
                    if (err.response.status == 500) {
                        setErrors({ ...errors, importProjects: err.response.data });
                    }
                });
        }
    }

    // Add a new project and send the information to be updated in the backend
    async function addProject() {
        if (currentProject.projectName === "") {
            setErrors({ ...errors, projectName: "GitHub repository name cannot be empty" });
        } else if (errors.projectName === "" && errors.collaborators === "") {
            axios.get(process.env.REACT_APP_API_URL + "/github/repositoryExists",
                { params: { name: currentProject.projectName, owner: localStorage.getItem("username") }, withCredentials: true }
            )
                .then((res) => {
                    if (res.data) {
                        setErrors({ ...errors, projectName: "Project with the following name already exists on GitHub" });
                    } else {
                        const newProjectData = {
                            projectName: currentProject.projectName,
                            owner: localStorage.getItem("username"),
                            collaborators: currentProject.collaborators,
                            isPrivate: currentProject.isPrivate,
                            creationDate: new Date()
                        }

                        axios.post(process.env.REACT_APP_API_URL + "/projects/addProject", newProjectData, { withCredentials: true })
                            .then((res) => {
                                setProjects([newProjectData, ...projects]);
                                document.getElementById('newProjectModalClose').click();
                            })
                            .catch((err) => {
                                console.log(err);
                                if (err.response.status == 500) {
                                    setErrors({ ...errors, addProject: err.response.data });
                                }
                            });
                    }
                })
        }
    }

    // Edit the currently selected project and send the information to the backend
    function editProject() {
        if (errors.collaborators === "") {
            axios.post(process.env.REACT_APP_API_URL + "/projects/editProject", currentProject, { withCredentials: true })
                .then((res) => {
                    setProjects([...projects.slice(0, selectedProjectIndex), currentProject, ...projects.slice(selectedProjectIndex + 1)])
                    document.getElementById('editProjectModalClose').click();
                })
                .catch((err) => {
                    console.log(err)
                    if (err.response.status == 500) {
                        setErrors({ ...errors, editProject: err.response.data });
                    }
                });
        }
    }
    
    // Delete the selected project and delete it from database in the backend as well
    function deleteProject() {
        axios.post(process.env.REACT_APP_API_URL + "/projects/deleteProject", currentProject, { withCredentials: true })
            .then((res) => {
                setProjects([...projects.slice(0, selectedProjectIndex), ...projects.slice(selectedProjectIndex + 1)])
                document.getElementById('deleteProjectModalClose').click();
            })
            .catch((err) => {
                if (err.response.status == 500) {
                    setErrors({ ...errors, editProject: err.response.data });
                }
            });
    }

    return (
        <div className='projectsPage'>
            <div className="container w-100 mw-100">
                <div className="row justify-content-start">
                    <div className="col">
                        <button type="button" className="btn btn-dark" onClick={resetModalStates} data-bs-toggle="modal" data-bs-target="#addProjectModal">New Project</button>
                        <button type="button" className="btn btn-dark" onClick={getImportProjects} data-bs-toggle="modal" data-bs-target="#importProjectModal" style={{ marginLeft: "15px" }}>Import Project</button>
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
                <hr className='mainDivider' />
                {projects.map((project, i) => {
                    if (searchTerm === "" || project.projectName.toLowerCase().startsWith(searchTerm.toLowerCase())) {
                        return (
                            <div key={project.projectName}>
                                <div className="row justify-content-start projectInfo">
                                    <a className="col-5 text-start projectName" href={'/project/' + project.owner + '/' + project.projectName}>
                                        {project.projectName}
                                    </a>
                                    <div className="col">
                                        {project.owner}
                                    </div>
                                    <div className="col">
                                        <div className='projectIcons float-end pr'>
                                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#editProjectModal" icon={faPenToSquare} onClick={(e) => { selectProject(i) }} />
                                            <FontAwesomeIcon data-bs-toggle="modal" data-bs-target="#deleteProjectModal" style={{ marginLeft: "15px" }} icon={faTrash} onClick={(e) => { selectProject(i) }} />
                                        </div>
                                    </div>
                                </div>
                                <hr className='projectDivider' />
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
                                <input type="text" className="form-control" onChange={(e) => { updateCurrentProject(e) }} value={currentProject.projectName} />
                                <div className="errorMessage">{errors.projectName}</div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Collaborator Username:</label>
                                <div className="row justify-content-start">
                                    <div className="col-7">
                                        <input type="text" className="form-control" onChange={(e) => { updateCollaboratorValue(e) }} value={collaboratorValue} />
                                        <div className="errorMessage">{errors.collaborators}</div>
                                    </div>
                                    <div className="col">
                                        <button type="button" className="btn btn-outline-dark" onClick={addProjectCollaborator}>Add Collaborator</button>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-row ">
                                {currentProject.collaborators.map((collaborator) =>
                                    <button key={collaborator} className='btn btn-outline-dark btn-sm collaboratorsList' onClick={(e) => { removeProjectCollaborator(collaborator) }}>{collaborator}</button>
                                )}
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" checked={currentProject.isPrivate} onChange={(e) => { setCurrentProject({ ...currentProject, isPrivate: e.target.checked }) }} />
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
            <div className="modal fade" id="importProjectModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="importProjectModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="importProjectModalLabel">Import Project</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='importProjectModalClose'></button>
                        </div>
                        <div className="modal-body">
                            <div className='importProjectsList'>
                                {importProjects.map((project, i) =>
                                    <div key={i} className='row importProjectItem'>
                                        <p className="col-10 text-start">{project.owner}:{project.projectName}</p>
                                        <button className={(selectedImportProjects.includes(i) ? 'btn-dark' : 'btn-outline-dark') + ' col btn text-center'}
                                            onClick={(e) => { clickImportProject(i) }}>
                                            Select
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-outline-dark" onClick={confirmImportedProjects}>Confirm Imports</button>
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
                                <label className="form-label">Collaborator Username:</label>
                                <div className="row justify-content-start">
                                    <div className="col-7">
                                        <input type="text" className="form-control" onChange={(e) => { updateCollaboratorValue(e) }} value={collaboratorValue} />
                                        <div className="errorMessage">{errors.collaborators}</div>
                                    </div>
                                    <div className="col">
                                        <button type="button" className="btn btn-outline-dark" onClick={addProjectCollaborator}>Add Collaborator</button>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-row ">
                                {currentProject.collaborators.map((collaborator) =>
                                    <button key={collaborator} className='btn btn-outline-dark btn-sm collaboratorsList' onClick={(e) => { removeProjectCollaborator(collaborator) }}>{collaborator}</button>
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