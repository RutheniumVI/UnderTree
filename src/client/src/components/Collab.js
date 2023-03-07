import React, { useEffect } from 'react';
import axios from 'axios';
import Modal from './LogsModal';

async function getLogs() {
  console.log("getting logs");      
  let values;
  await axios.get("http://localhost:8000/api/github/getGitLog", {
	params: {
		repo: "UnderTree",
		owner: "RutheniumVI",
	}, 
    withCredentials: true,
  }).then((res) => {
	values = res.data;
  }).catch((error) => {
    console.error(`Error adding collaborator`);
  });

  return values;
}

// const logModal = () => (
// 	<ul className="list-menu">
//         {setLogs.map(({ sha, url, commit }) => (
//           <li
//             key={sha}
//             // onClick={() => {
//             //   setActiveObject({ id, label, description });
//             //   setShowModal(true);
//             // }}
//             // className={getClass(id)}
//           >
//             <h2>{commit["message"]}</h2>
//           </li>
//         ))}
// 	</ul>
// )

async function handleRemoveCollab() {
  console.log("Removing user");
//   await axios.post("http://localhost:8000/api/github/removeCollaborator", {
//     repo: "UnderTree-Test",
//     userToRemove: "fahmed8383",
//   }, {
//     withCredentials: true,
//   }).then((res) => {
//     console.log(res.data)
//   }).catch((error) => {
//     console.error(`Error removing collaborator`);
//   });
}

function Collab() {

	const [showModal, setShowModal] = React.useState(false);
	const [logs, setLogs] = React.useState([]);

	useEffect(() => {
		getLogs().then((values) => {
			setLogs(values);
			console.log("Logs: ", values);
		});	
	}, []);

  	return (
		<div> 
		<h2>Get Repo Logs</h2>
		<button onClick={() => getLogs()}>
			Logs
		</button>
		<h2>Open Logs Modal</h2>
		<button
			onClick={() => {
			setShowModal(!showModal);
			}}
		>
			Open Modal
		</button>
		{showModal ? <Modal logs={logs} setShowModal={setShowModal} /> : null}
		</div>

	);
}

export default Collab;