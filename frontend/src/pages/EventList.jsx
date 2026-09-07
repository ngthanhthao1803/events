import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import toast from "react-hot-toast";
import { INVITATION_TEMPLATES, getTemplateById, detectSuggestedTemplate } from "../utils/invitationTemplates";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
`;

// Curated High-Res Cover Presets for Theme Matching & User Selection
const COVER_PRESETS = [
  {
    id: "sports",
    label: "Thể thao / Pickleball",
    icon: "",
    url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
    keywords: ["pickleball", "thể thao", "giải đấu", "sport", "tennis", "bóng", "cup", "tournament", "cầu lông", "bóng đá"]
  },
  {
    id: "opening",
    label: "Khai trương / Doanh nghiệp",
    icon: "",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    keywords: ["khai trương", "kỷ niệm", "thành lập", "opening", "công ty", "technova", "tân gia", "anniversary", "văn phòng"]
  },
  {
    id: "conference",
    label: "Hội nghị / Hội thảo",
    icon: "🎤",
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
    keywords: ["hội nghị", "khởi đầu", "hội thảo", "seminar", "summit", "conference", "diễn đàn", "forum", "toạ đàm"]
  },
  {
    id: "product",
    label: "Ra mắt sản phẩm / Công nghệ",
    icon: "",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    keywords: ["ra mắt", "sản phẩm", "launch", "showcase", "demo", "product", "công nghệ", "tech", "triển lãm"]
  },
  {
    id: "gala",
    label: "Dạ tiệc / Gala Dinner",
    icon: "",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
    keywords: ["tiệc", "gala", "dinner", "party", "khen thưởng", "tất niên", "tri ân", "celebration", "liên hoan"]
  },
  {
    id: "workshop",
    label: "Workshop / Đào tạo",
    icon: "",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    keywords: ["workshop", "đào tạo", "training", "khóa học", "chia sẻ", "meetup", "lớp"]
  }
];

function getEventCover(ev) {
  if (ev.coverImage && typeof ev.coverImage === "string" && ev.coverImage.trim()) {
    return ev.coverImage;
  }
  const text = `${ev.title || ""} ${ev.description || ""}`.toLowerCase();
  for (const preset of COVER_PRESETS) {
    if (preset.keywords.some((k) => text.includes(k))) {
      return preset.url;
    }
  }
  return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
}

function getEventStatus(dateStr) {
  if (!dateStr) return { label: "Sắp diễn ra", tone: "upcoming" };
  const evDate = new Date(dateStr);
  const now = new Date();

  const isToday =
    evDate.getFullYear() === now.getFullYear() &&
    evDate.getMonth() === now.getMonth() &&
    evDate.getDate() === now.getDate();

  if (isToday) {
    return { label: "Đang diễn ra", tone: "live" };
  }
  if (evDate > now) {
    return { label: "Sắp diễn ra", tone: "upcoming" };
  }
  return { label: "Đã kết thúc", tone: "past" };
}

// Styled Components
const PageContainer = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    padding: 1.25rem 0.85rem 3.5rem;
  }
`;

// Dashboard Hero Section
const DashboardHero = styled.div`
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(10, 185, 194, 0.08) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)"};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(10, 185, 194, 0.2)")};
  border-radius: 24px;
  padding: 1.5rem 1rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 12px 36px rgba(0, 0, 0, 0.3)" : "0 10px 30px rgba(10, 185, 194, 0.08)"};
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(170, 59, 255, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    border-radius: 18px;
    margin-bottom: 1.25rem;
  }
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.15)" : "rgba(10, 185, 194, 0.1)")};
  color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.3)" : "rgba(10, 185, 194, 0.25)")};
  margin-bottom: 0.75rem;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #0ab9c2;
    animation: ${pulseGlow} 2s infinite ease-in-out;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #0ab9c2 0%, #aa3bff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.65rem;
  }
`;

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.textMuted};
  max-width: 620px;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.88rem;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
    padding-top: 1rem;
  }
`;

const StatItem = styled.div`
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.03)" : "#ffffff")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)")};
  border-radius: 16px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    padding: 0.75rem 0.85rem;
    border-radius: 12px;
  }
`;

const StatNumber = styled.div`
  font-size: 1.65rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.02em;

  @media (max-width: 600px) {
    font-size: 1.35rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.textMuted};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

// Toolbar (Search, Filter, Create)
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 20px;
  padding: 0.85rem 1.25rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  backdrop-filter: blur(12px);

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0.85rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 999px;
  padding: 0.45rem 1rem;
  min-width: 260px;
  flex: 1;
  max-width: 380px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #0ab9c2;
    box-shadow: 0 0 0 3px rgba(10, 185, 194, 0.15);
  }

  .icon {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.textMuted};
  }

  @media (max-width: 860px) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 0.92rem;
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.inputPlaceholder};
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.35rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9")};
  padding: 0.25rem;
  border-radius: 999px;
  overflow-x: auto;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 860px) {
    width: 100%;
  }
`;

const FilterTab = styled.button`
  border: none;
  background: ${({ $active, theme }) =>
    $active ? (theme.isDark ? "rgba(10, 185, 194, 0.25)" : "#ffffff") : "transparent"};
  color: ${({ $active, theme }) => ($active ? (theme.isDark ? "#0ab9c2" : "#0891b2") : theme.textMuted)};
  font-weight: ${({ $active }) => ($active ? "700" : "600")};
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: ${({ $active, theme }) =>
    $active ? (theme.isDark ? "none" : "0 2px 6px rgba(0, 0, 0, 0.05)") : "none"};

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 480px) {
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
  }
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 860px) {
    width: 100%;
  }
`;

const SortSelect = styled.select`
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 12px;
  padding: 0.55rem 0.9rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #0ab9c2;
  }

  @media (max-width: 860px) {
    width: 100%;
  }
`;

const CreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #0ab9c2 0%, #2ec4ff 100%);
  color: #041216;
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.4rem;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(10, 185, 194, 0.35);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(10, 185, 194, 0.45);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 1.2rem;
  }
`;

// Events Grid
const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 1.5rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

// Event Card
const EventCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.cardShadow};
  backdrop-filter: blur(14px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  &:hover {
    transform: translateY(-6px);
    border-color: ${({ theme }) => theme.cardBorderHover};
    box-shadow: ${({ theme }) => theme.cardShadowHover};
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #0f172a;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.65) 100%);
  }

  @media (max-width: 480px) {
    height: 160px;
  }
`;

const CoverImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${EventCard}:hover & {
    transform: scale(1.05);
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  backdrop-filter: blur(8px);

  ${({ $tone }) =>
    $tone === "live"
      ? `
        background: rgba(34, 197, 94, 0.9);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
      `
      : $tone === "upcoming"
        ? `
        background: rgba(14, 165, 233, 0.9);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      `
        : `
        background: rgba(100, 116, 139, 0.85);
        color: #ffffff;
      `}

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    ${({ $tone }) => ($tone === "live" ? `animation: ${pulseGlow} 1.5s infinite;` : "")}
  }

  @media (max-width: 480px) {
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.25rem 0.65rem;
    font-size: 0.72rem;
  }
`;

const DateChip = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 10px;
  backdrop-filter: blur(8px);

  @media (max-width: 480px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.55rem;
    font-size: 0.72rem;
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 480px) {
    padding: 1.15rem 1rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 0.8rem 0;
  line-height: 1.35;
  color: ${({ theme }) => theme.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  ${EventCard}:hover & {
    color: #0ab9c2;
  }

  @media (max-width: 480px) {
    font-size: 1.15rem;
    margin-bottom: 0.65rem;
  }
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.textMuted};

  @media (max-width: 480px) {
    font-size: 0.82rem;
    gap: 0.4rem;
    margin-bottom: 0.9rem;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .icon {
    font-size: 0.95rem;
    flex-shrink: 0;
    color: #0ab9c2;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CardDesc = styled.p`
  margin: 0 0 1.25rem 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.textMuted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 480px) {
    font-size: 0.84rem;
    margin-bottom: 1rem;
  }
`;

const CardStatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.85rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)")};
  border-radius: 12px;
  margin-top: auto;
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.textMuted};

  @media (max-width: 480px) {
    font-size: 0.78rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }
`;

const CardStatChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;

  strong {
    color: ${({ theme }) => theme.text};
    font-weight: 800;
  }
`;

const CardFooter = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};

  @media (max-width: 380px) {
    flex-wrap: wrap;
  }
`;

const ManageBtn = styled(Link)`
  flex: 1;
  text-align: center;
  text-decoration: none;
  background: linear-gradient(135deg, rgba(10, 185, 194, 0.15) 0%, rgba(46, 196, 255, 0.15) 100%);
  color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.35)" : "rgba(10, 185, 194, 0.3)")};
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;

  &:hover {
    background: #0ab9c2;
    color: #041216;
    border-color: #0ab9c2;
    box-shadow: 0 4px 14px rgba(10, 185, 194, 0.3);
  }

  @media (max-width: 380px) {
    min-width: 100%;
    order: 1;
  }
`;

const PreviewBtn = styled(Link)`
  text-decoration: none;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)")};
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0")};
  }

  @media (max-width: 380px) {
    flex: 1;
    order: 2;
  }
`;

const DeleteBtn = styled.button`
  background: transparent;
  color: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.4)" : "#94a3b8")};
  border: 1px solid transparent;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
  }

  @media (max-width: 380px) {
    order: 3;
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4.5rem 2rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px dashed ${({ theme }) => theme.cardBorder};
  border-radius: 24px;
  grid-column: 1 / -1;

  .empty-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.35rem;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${({ theme }) => theme.textMuted};
    margin: 0 0 1.5rem 0;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
`;

// Create Modal Components
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => (theme.isDark ? "#161922" : "#ffffff")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)")};
  border-radius: 24px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 1.25rem 1rem;
    border-radius: 18px;
    max-height: 94vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0ab9c2, #aa3bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseBtn = styled.button`
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: ${({ theme }) => theme.text};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
  color: ${({ theme }) => theme.text};
`;

const FormInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #0ab9c2;
    box-shadow: 0 0 0 3px rgba(10, 185, 194, 0.15);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #0ab9c2;
    box-shadow: 0 0 0 3px rgba(10, 185, 194, 0.15);
  }
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-top: 0.5rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PresetCard = styled.div`
  position: relative;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${({ $selected }) => ($selected ? "#0ab9c2" : "transparent")};
  box-shadow: ${({ $selected }) => ($selected ? "0 0 12px rgba(10, 185, 194, 0.5)" : "none")};
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 4px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .check {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #0ab9c2;
    color: #041216;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: 0.6rem;
  }
`;

const ModalCancelBtn = styled.button`
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")};
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.14)" : "#e2e8f0")};
  }

  @media (max-width: 640px) {
    width: 100%;
    text-align: center;
  }
`;

const ModalSubmitBtn = styled.button`
  background: linear-gradient(135deg, #0ab9c2 0%, #2ec4ff 100%);
  color: #041216;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10, 185, 194, 0.35);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(10, 185, 194, 0.45);
  }

  @media (max-width: 640px) {
    width: 100%;
    text-align: center;
  }
`;

const TemplateTagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.15)" : "rgba(10, 185, 194, 0.12)")};
  color: ${({ theme }) => (theme.isDark ? "#38e1ea" : "#0891b2")};
  border: 1px solid rgba(10, 185, 194, 0.25);
  white-space: nowrap;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 0.5rem;
`;

const TemplateModalCard = styled.div`
  border-radius: 12px;
  padding: 0.65rem 0.6rem;
  cursor: pointer;
  background: ${({ $selected, theme }) =>
    $selected
      ? (theme.isDark ? "rgba(10, 185, 194, 0.2)" : "rgba(10, 185, 194, 0.12)")
      : (theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc")};
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? "#0ab9c2" : (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:hover {
    border-color: #0ab9c2;
    transform: translateY(-2px);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon {
    font-size: 1.3rem;
  }

  .check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0ab9c2;
    color: #041216;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
  }

  .title {
    font-size: 0.82rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text};
    line-height: 1.2;
  }

  .desc {
    font-size: 0.68rem;
    color: ${({ theme }) => theme.textMuted};
    line-height: 1.2;
  }
`;

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showModal, setShowModal] = useState(false);

  // Form State for creating new event
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    coverImage: COVER_PRESETS[0].url,
    category: "sports",
    template: "classic-gold",
  });

  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/events");
      setEvents(res.data || []);
    } catch (error) {
      console.error("Failed to fetch events", error);
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Quick stats calculation
  const stats = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let past = 0;
    let totalGuests = 0;

    events.forEach((ev) => {
      const { tone } = getEventStatus(ev.date);
      if (tone === "live") live++;
      else if (tone === "upcoming") upcoming++;
      else past++;

      if (ev.guestCount) totalGuests += ev.guestCount;
    });

    return { total: events.length, live, upcoming, past, totalGuests };
  }, [events]);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = (ev.title || "").toLowerCase().includes(q);
          const matchLocation = (ev.location || "").toLowerCase().includes(q);
          const matchDesc = (ev.description || "").toLowerCase().includes(q);
          if (!matchTitle && !matchLocation && !matchDesc) return false;
        }

        // Status tab
        if (statusFilter !== "all") {
          const { tone } = getEventStatus(ev.date);
          if (statusFilter === "live" && tone !== "live") return false;
          if (statusFilter === "upcoming" && tone !== "upcoming") return false;
          if (statusFilter === "past" && tone !== "past") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === "date-asc") {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortBy === "created-desc") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "title-asc") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [events, search, statusFilter, sortBy]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên sự kiện");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date ? new Date(formData.date) : new Date(),
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
        coverImage: formData.coverImage.trim() || undefined,
        category: formData.category || undefined,
        template: formData.template || "classic-gold",
      };

      const res = await axios.post("/api/events", payload);
      toast.success("Tạo sự kiện thành công!");
      setShowModal(false);
      navigate(`/admin/events/${res.data._id}`);
    } catch (error) {
      console.error("Failed to create event", error);
      toast.error("Không thể tạo sự kiện, vui lòng thử lại");
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không?`)) {
      return;
    }

    try {
      await axios.delete(`/api/events/${id}`);
      toast.success("Đã xóa sự kiện");
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
    } catch (error) {
      console.error("Failed to delete event", error);
      toast.error("Không thể xóa sự kiện");
    }
  };

  return (
    <PageContainer>
      {/* Dashboard Hero Header */}
      <DashboardHero>
        <HeroTop>
          <div>
            <HeroBadge>
              <span className="dot" />
              <span>Bảng Điều Khiển • EventFlow</span>
            </HeroBadge>
            <HeroTitle>Quản Lý Sự Kiện</HeroTitle>
            <HeroSubtitle>
              Theo dõi và điều phối tất cả sự kiện, phát hành thiệp mời số và giám sát quy trình
              check-in QR thời gian thực.
            </HeroSubtitle>
          </div>

          <CreateBtn
            type="button"
            onClick={() => {
              // Default to tomorrow 09:00 AM
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              const defaultDateStr = tomorrow.toISOString().slice(0, 16);

              setFormData({
                title: "",
                date: defaultDateStr,
                location: "",
                description: "",
                coverImage: COVER_PRESETS[0].url,
                category: "sports",
              });
              setShowModal(true);
            }}
          >
            <span>+</span> Tạo sự kiện mới
          </CreateBtn>
        </HeroTop>

        {/* <StatsRow>
          <StatItem>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>🎯 Tổng sự kiện</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber style={{ color: "#22c55e" }}>{stats.live}</StatNumber>
            <StatLabel>🟢 Đang diễn ra</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber style={{ color: "#0ab9c2" }}>{stats.upcoming}</StatNumber>
            <StatLabel>🔵 Sắp diễn ra</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber style={{ color: "#94a3b8" }}>{stats.past}</StatNumber>
            <StatLabel>🏁 Đã kết thúc</StatLabel>
          </StatItem>
        </StatsRow> */}
      </DashboardHero>

      {/* Toolbar: Search, Filter Tabs & Sort */}
      <Toolbar>
        <ToolbarLeft>
          <SearchBox>
            <span className="icon">🔍</span>
            <SearchInput
              placeholder="Tìm kiếm theo tên, địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </SearchBox>

          <FilterTabs>
            <FilterTab
              type="button"
              $active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả ({events.length})
            </FilterTab>
            <FilterTab
              type="button"
              $active={statusFilter === "upcoming"}
              onClick={() => setStatusFilter("upcoming")}
            >
              Sắp tới ({stats.upcoming})
            </FilterTab>
            <FilterTab
              type="button"
              $active={statusFilter === "live"}
              onClick={() => setStatusFilter("live")}
            >
              Đang chạy ({stats.live})
            </FilterTab>
            <FilterTab
              type="button"
              $active={statusFilter === "past"}
              onClick={() => setStatusFilter("past")}
            >
              Đã qua ({stats.past})
            </FilterTab>
          </FilterTabs>
        </ToolbarLeft>

        <ToolbarRight>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Mới nhất (Ngày sự kiện)</option>
            <option value="date-asc">Cũ nhất (Ngày sự kiện)</option>
            <option value="created-desc">Vừa tạo gần đây</option>
            <option value="title-asc">Tên sự kiện (A - Z)</option>
          </SortSelect>
        </ToolbarRight>
      </Toolbar>

      {/* Events Grid with Covers */}
      <EventsGrid>
        {filteredEvents.map((ev) => {
          const coverUrl = getEventCover(ev);
          const status = getEventStatus(ev.date);
          const evDate = new Date(ev.date);

          const formattedDate = !isNaN(evDate.getTime())
            ? evDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            : "Chưa xác định";

          const formattedTime = !isNaN(evDate.getTime())
            ? evDate.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "";

          const shortDateChip = !isNaN(evDate.getTime())
            ? `${evDate.getDate()} Th${evDate.getMonth() + 1}`
            : "Sự kiện";

          return (
            <EventCard key={ev._id}>
              {/* Cover Image & Badges */}
              <CoverWrapper>
                <CoverImg src={coverUrl} alt={ev.title} loading="lazy" />
                <StatusBadge $tone={status.tone}>
                  <span className="badge-dot" />
                  <span>{status.label}</span>
                </StatusBadge>
                <DateChip>{shortDateChip}</DateChip>
              </CoverWrapper>

              {/* Card Body */}
              <CardBody>
                <CardTitle title={ev.title}>{ev.title}</CardTitle>

                <CardMeta>
                  <MetaRow>
                    <span className="icon">🕒</span>
                    <span>
                      {formattedTime ? `${formattedTime} • ` : ""}
                      {formattedDate}
                    </span>
                  </MetaRow>
                  {ev.location && (
                    <MetaRow>
                      <span className="icon">📍</span>
                      <span title={ev.location}>{ev.location}</span>
                    </MetaRow>
                  )}
                </CardMeta>

                {ev.description ? (
                  <CardDesc>{ev.description}</CardDesc>
                ) : (
                  <CardDesc style={{ fontStyle: "italic", opacity: 0.6 }}>
                    Chưa có mô tả chi tiết cho sự kiện này.
                  </CardDesc>
                )}

                <CardStatsBar>
                  <CardStatChip>
                    <span>⏱</span>
                    <span>{ev.schedule?.length || 0} mốc lịch trình</span>
                  </CardStatChip>
                  {typeof ev.guestCount === "number" && ev.guestCount > 0 && (
                    <CardStatChip>
                      <span>👥</span>
                      <span>
                        <strong>{ev.guestCount}</strong> khách
                      </span>
                    </CardStatChip>
                  )}
                  <TemplateTagChip style={{ marginLeft: "auto" }} title="Phong cách thiệp mời của sự kiện">
                    <span>{getTemplateById(ev.template).icon}</span>
                    <span>{getTemplateById(ev.template).name}</span>
                  </TemplateTagChip>
                </CardStatsBar>

                {/* Actions */}
                <CardFooter>
                  <ManageBtn to={`/admin/events/${ev._id}`}>
                    <span>Quản lý</span>
                    <span>➔</span>
                  </ManageBtn>
                  <PreviewBtn
                    to={`/guest/preview/${ev._id}`}
                    title="Xem trước thiệp mời khách"
                  >
                    <span>👁️ Thiệp</span>
                  </PreviewBtn>
                  <DeleteBtn
                    type="button"
                    title="Xóa sự kiện"
                    onClick={() => handleDeleteEvent(ev._id, ev.title)}
                  >
                    🗑
                  </DeleteBtn>
                </CardFooter>
              </CardBody>
            </EventCard>
          );
        })}

        {!loading && filteredEvents.length === 0 && (
          <EmptyState>
            <div className="empty-icon">🎟️</div>
            <h3>Không tìm thấy sự kiện phù hợp</h3>
            <p>
              {search
                ? `Không có kết quả nào khớp với từ khóa "${search}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
                : "Chưa có sự kiện nào trong danh mục này."}
            </p>
            {search ? (
              <ModalCancelBtn type="button" onClick={() => setSearch("")}>
                Xóa bộ lọc tìm kiếm
              </ModalCancelBtn>
            ) : (
              <CreateBtn type="button" onClick={() => setShowModal(true)}>
                <span>+</span> Tạo sự kiện đầu tiên
              </CreateBtn>
            )}
          </EmptyState>
        )}
      </EventsGrid>

      {/* Modal Tạo Sự Kiện Mới */}
      {showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>Tạo Sự Kiện Mới</ModalTitle>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                  Điền thông tin và chọn ảnh bìa cho sự kiện của bạn
                </div>
              </div>
              <CloseBtn type="button" onClick={() => setShowModal(false)}>
                ×
              </CloseBtn>
            </ModalHeader>

            <form onSubmit={handleCreateEvent}>
              <FormGroup>
                <FormLabel>
                  Tên sự kiện <span style={{ color: "#ef4444" }}>*</span>
                </FormLabel>
                <FormInput
                  placeholder="VD: Giải Pickleball Doanh Nghiệp 2026..."
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    // Auto-select cover preset matching keywords if user hasn't manually customized
                    const text = newTitle.toLowerCase();
                    const matchedPreset = COVER_PRESETS.find((p) =>
                      p.keywords.some((k) => text.includes(k))
                    );
                    const suggestedTemplate = detectSuggestedTemplate(newTitle);
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      coverImage: matchedPreset ? matchedPreset.url : prev.coverImage,
                      category: matchedPreset ? matchedPreset.id : prev.category,
                      template: suggestedTemplate || prev.template,
                    }));
                  }}
                  required
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Thời gian tổ chức</FormLabel>
                <FormInput
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Địa điểm tổ chức</FormLabel>
                <FormInput
                  placeholder="VD: Trung tâm hội nghị Riverside Palace, Quận 4..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Mô tả ngắn sự kiện</FormLabel>
                <FormTextarea
                  placeholder="Mục đích, thông điệp hoặc lời chào gửi đến khách tham dự..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Chọn mẫu thiệp mời điện tử</FormLabel>
                {/* <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                  Giao diện thiệp mời khách sẽ nhận được (tự động phát hiện theo tên sự kiện hoặc bạn tự chọn):
                </div> */}

                <TemplateGrid>
                  {INVITATION_TEMPLATES.map((tmpl) => (
                    <TemplateModalCard
                      key={tmpl.id}
                      $selected={formData.template === tmpl.id}
                      onClick={() => setFormData({ ...formData, template: tmpl.id })}
                      title={tmpl.suitableFor}
                    >
                      <div className="top">
                        {/* <span className="icon">{tmpl.icon}</span> */}
                        {formData.template === tmpl.id && <span className="check">✓</span>}
                      </div>
                      <div className="title">{tmpl.name}</div>
                      <div className="desc">{tmpl.tagline}</div>
                    </TemplateModalCard>
                  ))}
                </TemplateGrid>
              </FormGroup>

              <FormGroup>
                <FormLabel>Chọn ảnh bìa đại diện</FormLabel>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                  Chọn nhanh từ bộ ảnh mẫu chuyên nghiệp hoặc dán link ảnh tùy chọn bên dưới:
                </div>

                <PresetGrid>
                  {COVER_PRESETS.map((p) => (
                    <PresetCard
                      key={p.id}
                      $selected={formData.coverImage === p.url}
                      onClick={() =>
                        setFormData({ ...formData, coverImage: p.url, category: p.id })
                      }
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} />
                      <div className="label">
                        {p.icon} {p.label}
                      </div>
                      {formData.coverImage === p.url && <div className="check">✓</div>}
                    </PresetCard>
                  ))}
                </PresetGrid>

                <div style={{ marginTop: "0.75rem" }}>
                  <FormInput
                    placeholder="Hoặc dán URL ảnh bìa tùy chỉnh (https://...)"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem" }}
                  />
                </div>
              </FormGroup>

              <ModalActions>
                <ModalCancelBtn type="button" onClick={() => setShowModal(false)}>
                  Hủy
                </ModalCancelBtn>
                <ModalSubmitBtn type="submit">Tạo sự kiện</ModalSubmitBtn>
              </ModalActions>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </PageContainer>
  );
}
