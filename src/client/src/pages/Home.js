import React from 'react';
import { useLayoutEffect } from 'react';
import Projects from './Projects';
import Filebar from '../components/Filebar';
import NewFileBar from '../components/NewFileBar';


function Home() {

    useLayoutEffect(() => {
        if(localStorage.getItem("username") !== null){
            window.location.href = "/projects"
        }
    }, []);

    return (
        <div>
            <NewFileBar></NewFileBar>
        </div>
    );
}
  
export default Home