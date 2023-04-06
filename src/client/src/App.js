/*
Author: Faiq Ahmed, Veerash Palanichamy
Date: March 5, 2023
Purpose: Allow navigation between the different pages by allocating a route to each page
*/

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Project from './pages/Project';
import Projects from './pages/Projects';

function App() {
  return (
    <div className="App">
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path='project/:owner/:projectName' element={<Project />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
