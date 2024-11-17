import { Outlet, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";


const Login = () => {

  const [userData, setUserData] = useState({username: "", password: ""});

  const handleUserName = (event) => {
    setUserData({...userData, username: event.target.value});
  }

  const handlePassword = (event) => {
    setUserData({...userData, password: event.target.value});
  }

  return (
    <div className="container">
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInput" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Enter your name"
            onChange={handleUserName}
            value={userData.username}
          />
          <label htmlFor="exampleInput" className="form-label">Password</label>
          <input
            type="text"
            className="form-control"
            id="password"
            placeholder="Enter your password"
            onChange={handlePassword}
            value={userData.password}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
};

export default Login;