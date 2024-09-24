import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/medicine_interface.png';
import '../css/login.css';

const LoginScreen = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = () => {
    if (!userId.trim() || !password.trim()) {
      alert('Please enter both User ID and Password.');
      return;
    }

    console.log('Password:', password);
  
    if (userId === 'Admin' && password === '123') {
      navigate(`/dashboard`);
    } else {
      alert('Wrong user ID or password!');
    }
  };

  return (
    <div className="login-page">
      <img src={img} alt="Logo" className="lp-logo" height={150} />
      <p className="company-title">MEDTRACK</p>
      <div className="login-form">
        <p className='welcome'>Welcome Back!</p>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          placeholder="Enter your User ID"
          onChange={(e) => setUserId(e.target.value)}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={submit}>Submit</button>
      </div>
    </div>
  );
};

export default LoginScreen;
