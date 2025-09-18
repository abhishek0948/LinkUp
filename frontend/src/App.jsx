import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login2 from "./pages/user_login/Login2";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}/>
      <Router>
        <Routes>
          <Route path="/user-login" element={<Login2/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
