import React, { createContext, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Profie from "./components/Profie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Createpost from "./components/Createpost";
import { LoginContext } from "./context/LoginContext";
import Modal from "./components/Modal";
import UserProfie from "./components/UserProfile";
import MyFolliwngPost from "./components/MyFollowingPost";
import BottomNavbar from "./components/bottombar";
import ReelsPage from './components/Reels';
import { EducationPage } from './pages/Education';
import { BusinessPage } from './pages/Business';
import { EntertainmentPage } from './pages/Entertainment';
import { SportsFitnessPage } from './pages/SportsFitness';
import { GamingPage } from './pages/Gaming';
import { FoodTravelPage } from './pages/FoodTravel';
import AIBotPage from './pages/AIBotPage';
import VideoPage from './components/VideoPage';

// import AudioBook from './components/AudioBook';

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <BrowserRouter>
      <div className="App">
        <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
          <Navbar login={userLogin} />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/reels" element={<ReelsPage />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/signin" element={<SignIn />}></Route>
            <Route exact path="/profile" element={<Profie />}></Route>
            <Route path="/createPost" element={<Createpost />}></Route>
            <Route path="/profile/:userid" element={<UserProfie />}></Route>
            <Route path="/followingpost" element={<MyFolliwngPost />}></Route>
            <Route path="/education" element={<EducationPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/entertainment" element={<EntertainmentPage />} />
            <Route path="/sports-fitness" element={<SportsFitnessPage />} />
            <Route path="/gaming" element={<GamingPage />} />
            <Route path="/food-travel" element={<FoodTravelPage />} />
            <Route path="/ai-bot" element={<AIBotPage />} />
            {/* <Route path="/audiobooks" element={<AudioBook />} /> */}
            <Route path="/videos" element={<VideoPage />} />
          </Routes>
          <ToastContainer theme="dark" />

          {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
          <BottomNavbar />
        </LoginContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
