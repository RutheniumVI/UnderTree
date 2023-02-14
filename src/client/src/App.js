import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Project from './pages/Project';
import Projects from './pages/Projects';
import Dev from './pages/Dev';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path='project/:owner/:projectName' element={<Project />}/>
          <Route path="/dev" element={<Dev />} />
        </Routes>  
      </BrowserRouter>
    </div>
  );
}

export default App;
