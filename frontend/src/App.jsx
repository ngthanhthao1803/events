import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import Home from "./pages/Home";
import GuestCheckIn from "./pages/GuestCheckIn";
import AdminLogin from "./pages/AdminLogin";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import GuestView from "./pages/GuestView";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: ${({ theme }) => theme.bodyBg};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s, color 0.3s;
  }
`;

const light = {
  bodyBg: "hsl(0, 0%, 98%)",
  text: "hsl(210, 10%, 15%)",
};

const dark = {
  bodyBg: "hsl(220, 10%, 10%)",
  text: "hsl(0, 0%, 95%)",
};

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    color: inherit;
    text-decoration: none;
    font-weight: 600;
    opacity: 0.8;
    transition:
      opacity 0.2s,
      color 0.2s;

    &:hover {
      opacity: 1;
      color: #0ab9c2;
    }
  }
`;

const ThemeButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: inherit;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

function Shell({ theme, toggleTheme }) {
  const location = useLocation();
  const hideHeader = /^\/guest\/[^/]+$/.test(location.pathname);

  return (
    <>
      {!hideHeader && (
        <Nav>
          <NavLinks>
            <Link to="/">Trang chủ</Link>
            {/* <Link to="/guest">Check-in Khách</Link> */}
            <Link to="/admin/events">Events</Link>
          </NavLinks>
          <ThemeButton onClick={toggleTheme}>
            {theme === dark ? "🌞 Sáng" : "🌙 Tối"}
          </ThemeButton>
        </Nav>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest" element={<GuestCheckIn />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/events" element={<EventList />} />
        <Route path="/admin/events/:id" element={<EventDetail />} />
        <Route path="/guest/:guestId" element={<GuestView />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? dark : light,
  );

  const toggleTheme = () => setTheme((t) => (t === dark ? light : dark));

  useEffect(() => {
    localStorage.setItem("theme", theme === dark ? "dark" : "light");
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Shell theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
