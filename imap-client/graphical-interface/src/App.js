import './App.css';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.js";
import Login from "./pages/Login.js";


const App = () => {

  const client = createConnection(2525, 'localhost', () => {
    console.log('Yhteys palvelimeen avattu.');
    // Lähetetään viesti palvelimelle
    client.write('MAIL FROM:owner');
  });
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
  
export default App;
