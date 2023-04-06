import { React } from 'react';
import { useLayoutEffect } from 'react';
import '../Styles/Home.css'

function Home() {
	useLayoutEffect(() => {
		if (localStorage.getItem("username") !== null) {
			window.location.href = "/projects"
		}
	}, []);

	return (
		<div className='backgroundImage d-flex align-items-center justify-content-center'>
			<div className='mainContent'>
				<h1>Collaborative Text Editor</h1>
				<h2>With GitHub Source Control Integration</h2>
				<a href={"https://github.com/login/oauth/authorize?scope=user%20repo%20admin:org&client_id=" + process.env.REACT_APP_CLIENT_ID}>
					<button className="btn btn-primary btn-lg">Get Started</button>
				</a>
			</div>
		</div>
	);
}

export default Home