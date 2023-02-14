import React, { useState } from 'react'
import '../Styles/Filebar.css'

function Filebar() {
    const [files, setFiles] = useState([]);
  return (
    <div className="card my-card borders">
        <div className="card-header borders">
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-file-earmark-plus"></i>
            </button> 
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-cloud-upload"></i>
            </button>     
        </div>
        <div className="card-body borders">
            This is some text within a card body.
        </div>
    </div>
  )
}

export default Filebar