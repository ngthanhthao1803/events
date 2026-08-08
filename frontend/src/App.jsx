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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
`;

function Shell({ theme, toggleTheme }) {
  const location = useLocation();
  const hideHeader = /^\/guest\/[^/]+$/.test(location.pathname);

  return (
    <>
      {!hideHeader && (
        <Nav>
          <div>
            <Link to="/">Home</Link> | <Link to="/guest">Guest</Link> |{" "}
            <Link to="/admin/login">Admin</Link>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            {theme === dark ? "🌞 Light" : "🌙 Dark"}
          </button>
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
