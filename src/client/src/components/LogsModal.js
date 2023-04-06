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
					<button className="button" onClick={() => { setShowModal(false) }}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default Modal;