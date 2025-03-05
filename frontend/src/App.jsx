import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'

// Components
import Navbar from './components/Navbar'
//Login-registerPage
import RegisterForm from './components/LogReg/RegisterForm'
import LoginForm from './components/LogReg/LoginForm'
import ForgotPassword from './components/LogReg/ForgotPassword';
//Main Pages
import Dashboard from './components/MainPage/Dashboard'
import Profile from './components/MainPage/Profile'
//All functions Chat
import ChatPage from './components/FunChat/ChatPage';
//blocks Token
import ProtectedRoute from './components/ProtectedRoute' //import กันยังไม่ล็อคอิน
import PublicRoute from './components/PublicRoute' // import หน้าที่เข้าได้เลยไม่ต้อง login


function App() {
  const [isAuthenticated, setAuth] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
     
      <div>
        <Routes>
          <Route path='/register' element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            } />
          <Route path="/forgot-password" element={
            <ForgotPassword />
            } />
          <Route path='/loginForm' element={
              <PublicRoute>
                <LoginForm setAuth={setAuth} />
              </PublicRoute>
            } />  
          <Route path='/dashboard' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path='/profile' element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/chat/:chatId" element={
              <ProtectedRoute>
                <Navbar />
                <ChatPage />
                </ProtectedRoute>
            } />
            <Route path='/' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

        </Routes>
      </div>
    </Router>
  )
}

export default App
