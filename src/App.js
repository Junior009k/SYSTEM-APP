import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from './Auth/Components/Login';
import Register from './Auth/Components/Register';
import ClientesCRUD from './Auth/Components/Client';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Login/> } />
        <Route path="/Register" element={ <Register/> } />
        <Route path="/Clientes" element={ <ClientesCRUD/> } />
      </Routes>
    </div>
      
  );
}

export default App;
