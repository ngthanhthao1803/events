import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2.5rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)")};
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 20px 50px rgba(0, 0, 0, 0.3)" : "0 10px 30px rgba(0, 0, 0, 0.06)"};
  backdrop-filter: blur(12px);
  border-radius: 20px;
  text-align: center;
`;

const StyledInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "#f8fafc")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)")};
  border-radius: 12px;
  color: inherit;
  font-size: 1rem;
  outline: none;
  margin-bottom: 0.85rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #0ab9c2;
  }

  &::placeholder {
    color: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.45)" : "#94a3b8")};
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #0ab9c2, #2ec4ff);
  color: #041216;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 2.2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(11, 185, 194, 0.35);
  }
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
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <Container>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Admin Login</h2>
      {error && <p style={{ color: '#e74c3c', marginBottom: "1rem" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <StyledInput
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <StyledInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <SubmitButton type="submit">
          Đăng Nhập
        </SubmitButton>
      </form>
    </Container>
  );
}
