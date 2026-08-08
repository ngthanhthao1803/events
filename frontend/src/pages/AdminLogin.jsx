import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  text-align: center;
`;

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/events');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Container>
      <h2>Admin Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '0.5rem' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.8rem 2rem' }}>
          Login
        </button>
      </form>
    </Container>
  );
}
