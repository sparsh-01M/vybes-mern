import React, { createContext, useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Profile from "./components/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Createpost from "./components/Createpost";
import { LoginContext } from "./context/LoginContext";
import Modal from "./components/Modal";
import UserProfile from "./components/UserProfile";
import MyFolliwngPost from "./components/MyFollowingPost";
import BottomNavbar from "./components/bottombar";
import ReelsPage from './components/Reels';
import { EducationPage } from './pages/Education';
import { BusinessPage } from './pages/Business';
import { EntertainmentPage } from './pages/Entertainment';
import { SportsFitnessPage } from './pages/SportsFitness';
import { GamingPage } from './pages/Gaming';
import { FoodTravelPage } from './pages/FoodTravel';
import Audiobook from './components/Audiobook';
import AudiobookPlayer from './components/AudiobookPlayer';
import AIBot from './components/AIBot';
import Videos from './pages/Videos';

// import AudioBook from './components/AudioBook';

export const UserContext = createContext();

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Set user state from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <UserContext.Provider value={{ state: user, dispatch: setUser }}>
          <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
            <Navbar login={userLogin} />
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/reels" element={<ReelsPage />}></Route>
              <Route path="/signup" element={<SignUp />}></Route>
              <Route path="/signin" element={<SignIn />}></Route>
              <Route exact path="/profile" element={<Profile />}></Route>
              <Route path="/createPost" element={<Createpost />}></Route>
              <Route path="/profile/:userid" element={<UserProfile />}></Route>
              <Route path="/followingpost" element={<MyFolliwngPost />}></Route>
              <Route path="/education" element={<EducationPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/entertainment" element={<EntertainmentPage />} />
              <Route path="/sports-fitness" element={<SportsFitnessPage />} />
              <Route path="/gaming" element={<GamingPage />} />
              <Route path="/food-travel" element={<FoodTravelPage />} />
              <Route path="/audiobooks" element={<Audiobook />} />
              <Route path="/audiobook/:id" element={<AudiobookPlayer />} />
              <Route path="/ai-chat" element={<AIBot />} />
              <Route path="/videos" element={<Videos />} />
            </Routes>
            <ToastContainer theme="dark" />

            {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
            <BottomNavbar />
          </LoginContext.Provider>
        </UserContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
