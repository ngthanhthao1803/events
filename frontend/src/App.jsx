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
import { Toaster } from "react-hot-toast";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: ${({ theme }) => theme.bodyBg};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s, color 0.3s;
  }
  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.text};
  }
`;

const light = {
  mode: "light",
  isDark: false,
  bodyBg: "#f8fafc",
  text: "#0f172a",
  textMuted: "#64748b",
  cardBg: "rgba(255, 255, 255, 0.85)",
  cardBgSolid: "#ffffff",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  cardBorderHover: "rgba(10, 185, 194, 0.5)",
  navBg: "rgba(255, 255, 255, 0.85)",
  navBorder: "rgba(0, 0, 0, 0.08)",
  inputBg: "#ffffff",
  inputBorder: "rgba(0, 0, 0, 0.15)",
  inputPlaceholder: "#94a3b8",
  buttonSecondaryBg: "#ffffff",
  buttonSecondaryHover: "#f1f5f9",
  buttonSecondaryBorder: "rgba(0, 0, 0, 0.12)",
  cardShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  cardShadowHover: "0 16px 36px rgba(10, 185, 194, 0.12)",
  blobOpacity: 0.12,
  divider: "rgba(0, 0, 0, 0.08)",
  chipBg: "#f1f5f9",
  chipBorder: "rgba(0, 0, 0, 0.15)",
  previewBtnBg: "#f8fafc",
  previewBtnBorder: "rgba(0, 0, 0, 0.1)",
};

const dark = {
  mode: "dark",
  isDark: true,
  bodyBg: "hsl(220, 10%, 10%)",
  text: "hsl(0, 0%, 95%)",
  textMuted: "rgba(255, 255, 255, 0.65)",
  cardBg: "rgba(255, 255, 255, 0.035)",
  cardBgSolid: "rgba(255, 255, 255, 0.05)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  cardBorderHover: "rgba(10, 185, 194, 0.4)",
  navBg: "rgba(18, 20, 24, 0.75)",
  navBorder: "rgba(255, 255, 255, 0.08)",
  inputBg: "rgba(255, 255, 255, 0.06)",
  inputBorder: "rgba(255, 255, 255, 0.15)",
  inputPlaceholder: "rgba(255, 255, 255, 0.45)",
  buttonSecondaryBg: "rgba(255, 255, 255, 0.08)",
  buttonSecondaryHover: "rgba(255, 255, 255, 0.16)",
  buttonSecondaryBorder: "rgba(255, 255, 255, 0.18)",
  cardShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
  cardShadowHover: "0 20px 40px rgba(0, 0, 0, 0.4)",
  blobOpacity: 0.22,
  divider: "rgba(255, 255, 255, 0.08)",
  chipBg: "rgba(255, 255, 255, 0.08)",
  chipBorder: "rgba(255, 255, 255, 0.2)",
  previewBtnBg: "rgba(255, 255, 255, 0.06)",
  previewBtnBorder: "rgba(255, 255, 255, 0.12)",
};

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 2rem;
  background: ${({ theme }) => theme.navBg};
  backdrop-filter: blur(16px);
  border-bottom: 1px solid ${({ theme }) => theme.navBorder};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "0 2px 12px rgba(0, 0, 0, 0.04)"};

  @media (max-width: 680px) {
    padding: 0.85rem 1rem;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: inherit;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;

  .logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.1rem;
    box-shadow: 0 4px 14px rgba(10, 185, 194, 0.35);
  }

  .brand-tag {
    font-size: 0.5rem;
    font-weight: 700;
    padding: 0.1rem 0.2rem;
    border-radius: 10px;
    background: rgba(10, 185, 194, 0.12);
    border: 1px solid rgba(10, 185, 194, 0.25);
    color: #0ab9c2;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  a {
    color: inherit;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    opacity: 0.8;
    transition: opacity 0.2s, color 0.2s;

    &:hover {
      opacity: 1;
      color: #0ab9c2;
    }
  }

  @media (max-width: 680px) {
    display: none;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: ${({ theme }) => theme.buttonSecondaryBg};
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  border-radius: 999px;
  width: 36px;
  height: 36px;
  color: inherit;
  font-size: 1.15rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonSecondaryHover};
  }

  @media (max-width: 680px) {
    display: inline-flex;
  }
`;

const MobileDropdown = styled.div`
  display: none;
  @media (max-width: 680px) {
    display: ${({ $open }) => ($open ? "flex" : "none")};
    flex-direction: column;
    background: ${({ theme }) => theme.navBg};
    backdrop-filter: blur(20px);
    border-bottom: 1px solid ${({ theme }) => theme.navBorder};
    padding: 0.85rem 1rem;
    gap: 0.4rem;
    position: sticky;
    top: 57px;
    z-index: 99;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

    a {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.65rem 0.85rem;
      border-radius: 12px;
      transition: background 0.2s, color 0.2s;

      &:hover, &:focus {
        background: rgba(10, 185, 194, 0.12);
        color: #0ab9c2;
      }
    }
  }
`;

const ThemeButton = styled.button`
  background: ${({ theme }) => theme.buttonSecondaryBg};
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  cursor: pointer;
  color: inherit;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: ${({ theme }) => (theme.isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)")};

  &:hover {
    background: ${({ theme }) => theme.buttonSecondaryHover};
    border-color: rgba(10, 185, 194, 0.4);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.82rem;
  }
`;

function Shell({ theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const hideHeader = /^\/guest\/[^/]+(\/.*)?$/.test(location.pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {!hideHeader && (
        <>
          <Nav>
            <NavLeft>
              <Brand to="/">
                <div className="logo-icon">⚡</div>
                <span>Events</span>
                <span className="brand-tag">Realtime</span>
              </Brand>
              <NavLinks>
                <Link to="/">Trang chủ</Link>
                <Link to="/admin/events">Sự kiện</Link>
                {/* <Link to="/guest">Check-in Test</Link> */}
                {/* <Link to="/admin/login">Ban tổ chức</Link> */}
              </NavLinks>
            </NavLeft>
            <NavRight>
              <ThemeButton onClick={toggleTheme}>
                {theme === dark ? "🌞" : "🌙"}
              </ThemeButton>
              <MobileMenuBtn
                type="button"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </MobileMenuBtn>
            </NavRight>
          </Nav>
          <MobileDropdown $open={mobileMenuOpen}>
            <Link to="/admin/events">Sự kiện</Link>
          </MobileDropdown>
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest" element={<GuestCheckIn />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/events" element={<EventList />} />
        <Route path="/admin/events/:id" element={<EventDetail />} />
        <Route path="/guest/preview/:eventId" element={<GuestView isPreview={true} />} />
        <Route path="/guest/:guestId/*" element={<GuestView isPreview={false} />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") return light;
    if (saved === "dark") return dark;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? dark : light;
  });

  const toggleTheme = () => setTheme((t) => (t === dark ? light : dark));

  useEffect(() => {
    localStorage.setItem("theme", theme === dark ? "dark" : "light");
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Toaster position="top-right" />
      <BrowserRouter>
        <Shell theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
