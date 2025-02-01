import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';

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