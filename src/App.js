import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from './Auth/Components/Login';
import Register from './Auth/Components/Register';

function App() {
  return (
    <div className="App">
       <h1 className="App">Sistema de Restaurante y Bares </h1>
      <Routes>
        <Route path="/" element={ <Login/> } />
        <Route path="/Register" element={ <Register/> } />
      </Routes>
    </div>
      
  );
}

export default App;
