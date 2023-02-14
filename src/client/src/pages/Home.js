import React from 'react';
import { useLayoutEffect } from 'react';
import Projects from './Projects';
import Filebar from '../components/Filebar';
import NewFileBarPage from '../pages/NewFileBarPage';


function Home() {

    useLayoutEffect(() => {
        if(localStorage.getItem("username") !== null){
            window.location.href = "/projects"
        }
    }, []);

    return (
        <div>
            <NewFileBarPage></NewFileBarPage>
        </div>
    );
}
  
export default Home