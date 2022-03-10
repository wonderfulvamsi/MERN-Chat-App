import "./App.css";
import LoginPg from './LoginPg'
import RegPg from './RegPg'
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPg />} />
          <Route path="/signup" element={<RegPg />} />
          <Route path="/home/:username" element=
            {
              <Home socket={socket} />
            } />
        </Routes>
      </Router>
    </>
  );
}

export default App;