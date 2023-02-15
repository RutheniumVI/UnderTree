import React from "react";
import "../Styles/LogsModal.css";
	
function Modal({ logs, setShowModal }) {
	const logsLength = logs.length < 10 ? logs.length : 10;
	logs = logs.slice(0, logsLength);

	console.log("Modal Logs: ", logs);
	return (

		<div className="log-modal">
			<div className="log-modal-content">
				<div className="log-modal-header">
					<h4 className="log-modal-title">Logs</h4>
				</div>
				<div className="log-modal-body">
					<ul>
						{logs.map(({ sha, commit }) => (
							<li key={sha} >
								<p>Author: {commit["author"]["name"]}</p>
								<p>Date: {commit["author"]["date"]}</p>
								<p>Message: {commit["message"]}</p>
								<p>Commit: {sha}</p>
							</li>
						))}
					</ul>
				</div>
				<div className="log-modal-footer">
					<button className="button" onClick={()=> {setShowModal(false)}}>
						Close
					</button>
				</div>
			</div>
		</div>

		// <div className="modal fade" id="gitLogsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="gitLogsModal" aria-hidden="true">
		// 	<div className="modal-dialog modal-dialog-scrollable">
		// 		<div className="modal-content">
		// 		<div className="modal-header">
		// 			<h1 className="modal-title fs-5" id="gitLogsModalLabel">Logs</h1>
		// 			<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id='editProjectModalClose'></button>
		// 		</div>
		// 		<div className="modal-body">
		// 			<div className="d-flex flex-row ">
		// 				<p> 
		// 					{logs.map(({ commit, sha }) => 
		// 						{commit["author"]["name"]}
		// 					)}
		// 				</p>
		// 			</div>
		// 		</div>
		// 		<div className="modal-footer">
		// 			<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
		// 		</div>
		// 		</div>
		// 	</div>
		// </div>
	);
}

export default Modal;