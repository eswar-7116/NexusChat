import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div>
      <NavBar />

      <Routes>
        <Route path='/' element={ <HomePage /> } />
        <Route path='/signup' element={ <SignUpPage /> } />
        <Route path='/login' element={ <LoginPage /> } />
      </Routes>
    </div>
  )
}

export default App;