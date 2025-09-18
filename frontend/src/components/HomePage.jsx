import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ChatList from "../pages/chat_section/ChatList";
import Layout from "./Layout";
import useLayoutStore from "../store/useLayoutStore";
import { getAllUsers } from "../services/user.service";

const HomePage = () => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);

  const [allUsers,setAllUsers] = useState([]);
  const getAllUser = async () => {
    try {
      const result = await getAllUsers();
      if(result.status === "success") {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.log("Error getting all users",error.message);
    }
  }
  
  useEffect(() => {
    getAllUser();
  },[]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList contacts={allUsers} />
      </motion.div>
    </Layout>
  );
};

export default HomePage;
