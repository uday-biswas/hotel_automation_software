import './App.css'
import { Routes, Route } from 'react-router-dom'
// import Navbar from './components/common/Navbar'
// import Manager from './components/Manager'
// import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import ManagerPage from './pages/ManagerPage'
import ReceptionistPage from './pages/ReceptionistPage'
import CatererPage from './pages/CatererPage'

function App() {

  return (
    <div
      className="w-full flex flex-col font-inter bg-gray-300 py-3 "
    >
      {/* <Navbar /> */}

      <Routes>
        <Route path="/" element={<HomePage />}></Route>

        {/* <Route
          element={
            <PrivateRoute>
              <Manager />
            </PrivateRoute>
          }
        >
        </Route> */}
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/receptionist" element={<ReceptionistPage />} />
        <Route path="/caterer" element={<CatererPage />} />

        {/* <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/update-password/:id" element={<UpdatePassword />} />

        <Route path="*" element={< Error />} /> */}
      </Routes>
    </div>
  )
}

export default App
