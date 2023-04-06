/*
Author: Kevin Kannammalil
Date: May 10, 2023
Purpose: Handler for the logout button in the navbar
*/

import React from 'react';
import axios from 'axios';

// This component is used to logout by calling the server API and clears the local storage
async function handleLogout() {
	console.log("Logging out");
	await axios.get(process.env.REACT_APP_API_URL + "/auth/logout", {
		withCredentials: true,
	}).then((res) => {
		localStorage.removeItem('username');
		window.location.reload();
	}).catch((error) => {
		console.error(`Error logging user out from GitHub`);
	});
}

function Logout() {
	return (
		<div>
			<h2>Logout</h2>
			<button onClick={() => handleLogout()}>
				Logout
			</button>
		</div>

	);
}

export default Logout;