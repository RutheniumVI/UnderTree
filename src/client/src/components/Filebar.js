import React, { useState } from 'react'
import '../Styles/Filebar.css'

function Filebar() {
    const [files, setFiles] = useState([{name:"file1"},{name:"file2"},{name:"file3"}]);
  return (
    <div className="card my-card">
        <div className="card-header">
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-file-earmark-plus"></i>
            </button> 
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-cloud-upload"></i>
            </button>     
        </div>
        <div className="card-body borders">
            <div className="list-group list-group-flush">
                {files.map((file) => {
                    return <a href="#" class="list-group-item list-group-item-action">
                    {file.name}</a>
                })}
            </div>
        </div>
    </div>
  )
}

export default Filebar