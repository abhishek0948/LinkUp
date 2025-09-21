import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProtectedRoute, PublicRoute } from "./Protected";

import Login from "./pages/user_login/Login";
import Status from "./pages/status_section/Status";
import Setting from "./pages/setting_section/Setting";
import HomePage from "./components/HomePage";
import UserDetails from "./components/UserDetails";
import useUserStore from "./store/useUserStore";
import { useEffect } from "react";
import { disconnectSocket, initializeSocket } from "./services/chat.service";
import { useChatStore } from "./store/useChatStore";

function App() {
  const {user} = useUserStore();
  const {setCurrentUser,initSocketListners,cleanUp} = useChatStore();

  useEffect(() => {
    if(user?._id) {
      const socket = initializeSocket();

      if(socket) {
        setCurrentUser(user);
        initSocketListners();
      }
    }
    
    return () => {
      cleanUp()
      disconnectSocket();
    }
  },[user,setCurrentUser,initSocketListners]);
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}/>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login/>}/>
          </Route>

          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<HomePage/>} />
            <Route path="/user-profile" element={<UserDetails />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/status" element={<Status />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
