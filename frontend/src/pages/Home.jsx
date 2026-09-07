import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { getTemplateById } from "../utils/invitationTemplates";

// Curated High-Res Cover Presets for Theme Matching & Fallbacks
const COVER_PRESETS = [
  {
    id: "sports",
    label: "Thể thao / Pickleball",
    url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
    keywords: ["pickleball", "thể thao", "giải đấu", "sport", "tennis", "bóng", "cup", "tournament", "cầu lông", "bóng đá"]
  },
  {
    id: "opening",
    label: "Khai trương / Doanh nghiệp",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    keywords: ["khai trương", "kỷ niệm", "thành lập", "opening", "công ty", "technova", "tân gia", "anniversary", "văn phòng"]
  },
  {
    id: "conference",
    label: "Hội nghị / Hội thảo",
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
    keywords: ["hội nghị", "khởi đầu", "hội thảo", "seminar", "summit", "conference", "diễn đàn", "forum", "toạ đàm"]
  },
  {
    id: "product",
    label: "Ra mắt sản phẩm / Công nghệ",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    keywords: ["ra mắt", "sản phẩm", "launch", "showcase", "demo", "product", "công nghệ", "tech", "triển lãm"]
  },
  {
    id: "gala",
    label: "Dạ tiệc / Gala Dinner",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
    keywords: ["tiệc", "gala", "dinner", "party", "khen thưởng", "tất niên", "tri ân", "celebration", "liên hoan"]
  },
  {
    id: "workshop",
    label: "Workshop / Đào tạo",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    keywords: ["workshop", "đào tạo", "training", "khóa học", "chia sẻ", "meetup", "lớp"]
  }
];

function getEventCover(ev) {
  if (ev?.coverImage && typeof ev.coverImage === "string" && ev.coverImage.trim()) {
    return ev.coverImage;
  }
  const text = `${ev?.title || ""} ${ev?.description || ""}`.toLowerCase();
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

// Animations
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const PageWrapper = styled.div`
  min-height: calc(100vh - 72px);
  position: relative;
  overflow-x: hidden;
  padding-bottom: 5rem;
`;

// Background Ambient Glow Blobs
const AmbientBlob = styled.div`
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: ${({ theme }) => theme.blobOpacity || 0.15};

  &.top-right {
    top: -5rem;
    right: -10rem;
    width: 32rem;
    height: 32rem;
    background: radial-gradient(circle, #0ab9c2, transparent 70%);
  }

  &.mid-left {
    top: 35rem;
    left: -12rem;
    width: 36rem;
    height: 36rem;
    background: radial-gradient(circle, #aa3bff, transparent 70%);
  }

  &.bottom-right {
    bottom: 10rem;
    right: -8rem;
    width: 30rem;
    height: 30rem;
    background: radial-gradient(circle, #2ec4ff, transparent 70%);
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`;

// Hero Section
const HeroSection = styled.section`
  padding: 4.5rem 0 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  background: ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.12)" : "rgba(10, 185, 194, 0.1)")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.3)" : "rgba(10, 185, 194, 0.35)")};
  color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.75rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
    box-shadow: 0 0 10px ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
    animation: ${pulseGlow} 2s infinite ease-in-out;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 1.25rem 0;
  max-width: 900px;
  color: ${({ theme }) => theme.text};

  .gradient-text {
    background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, #0ab9c2 0%, #aa3bff 55%, #ff5287 100%)"
      : "linear-gradient(135deg, #0891b2 0%, #7c3aed 55%, #db2777 100%)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  max-width: 760px;
  margin: 0 0 2.5rem 0;
  color: ${({ theme }) => theme.textMuted};
`;

const HeroButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3.5rem;
`;

const PrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #0ab9c2 0%, #2ec4ff 100%);
  color: #041216;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  box-shadow: 0 8px 25px rgba(10, 185, 194, 0.35);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(10, 185, 194, 0.5);
  }
`;

const SecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: inherit;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  font-weight: 600;
  font-size: 1rem;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => (theme.isDark ? "none" : "0 2px 8px rgba(0, 0, 0, 0.05)")};
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonSecondaryHover};
    border-color: rgba(10, 185, 194, 0.4);
    transform: translateY(-2px);
  }
`;

const OutlineBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: ${({ theme }) => (theme.isDark ? "transparent" : "#ffffff")};
  color: ${({ theme }) => (theme.isDark ? "inherit" : "#7c3aed")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.4)" : "rgba(124, 58, 237, 0.35)")};
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  box-shadow: ${({ theme }) => (theme.isDark ? "none" : "0 2px 8px rgba(0, 0, 0, 0.04)")};
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.12)" : "rgba(124, 58, 237, 0.08)")};
    border-color: #aa3bff;
    transform: translateY(-2px);
  }
`;

// Metrics Bar
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  width: 100%;
  max-width: 1050px;
  margin-top: 1rem;
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${({ theme }) => theme.cardBorderHover};
    transform: translateY(-3px);
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff")};
    box-shadow: ${({ theme }) => theme.cardShadowHover};
  }

  .icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;

    &.speed {
      background: ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.14)" : "rgba(10, 185, 194, 0.1)")};
      border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.3)" : "rgba(10, 185, 194, 0.25)")};
      color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
    }

    &.realtime {
      background: ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.14)" : "rgba(124, 58, 237, 0.1)")};
      border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.3)" : "rgba(124, 58, 237, 0.25)")};
      color: ${({ theme }) => (theme.isDark ? "#c084fc" : "#7c3aed")};
    }

    &.vip {
      background: ${({ theme }) => (theme.isDark ? "rgba(245, 158, 11, 0.14)" : "rgba(245, 158, 11, 0.1)")};
      border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.25)")};
      color: #f59e0b;
    }

    &.shield {
      background: ${({ theme }) => (theme.isDark ? "rgba(34, 197, 94, 0.14)" : "rgba(34, 197, 94, 0.1)")};
      border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.25)")};
      color: #22c55e;
    }

    svg {
      width: 25px;
      height: 25px;
      display: block;
    }
  }

  &:hover .icon-box {
    transform: scale(1.08);
  }

  .num {
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.2;
    background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, #0ab9c2, #2ec4ff)"
      : "linear-gradient(135deg, #0891b2, #0284c7)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .desc {
    font-size: 0.85rem;
    margin: 0.15rem 0 0;
    color: ${({ theme }) => theme.textMuted};
  }
`;

// Ticket Lookup & Quick Action Hub
const LookupSection = styled.section`
  margin: 3.5rem 0 4.5rem;
`;

const LookupCard = styled.div`
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))"
      : "#ffffff"};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  backdrop-filter: blur(20px);
  border-radius: 26px;
  padding: 2.25rem;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 20px 50px rgba(0, 0, 0, 0.2)" : "0 12px 35px rgba(0, 0, 0, 0.06)"};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0ab9c2, #aa3bff, #2ec4ff);
  }
`;

const LookupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.75rem;

  h2 {
    font-size: 1.6rem;
    margin: 0 0 0.4rem 0;
    color: ${({ theme }) => theme.text};
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.textMuted};
  }
`;

const LookupForm = styled.form`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const LookupInput = styled.input`
  flex: 1;
  min-width: 260px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 14px;
  padding: 0.9rem 1.25rem;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #0ab9c2;
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.09)" : "#ffffff")};
    box-shadow: 0 0 0 3px rgba(10, 185, 194, 0.2);
  }

  &::placeholder {
    color: ${({ theme }) => theme.inputPlaceholder};
  }
`;

const LookupSubmitBtn = styled.button`
  background: linear-gradient(135deg, #0ab9c2, #2ec4ff);
  color: #041216;
  border: none;
  border-radius: 14px;
  padding: 0.9rem 2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(10, 185, 194, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ChipsRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};

  .label {
    opacity: 0.8;
    margin-right: 0.2rem;
  }

  button {
    background: ${({ theme }) => theme.chipBg};
    border: 1px dashed ${({ theme }) => theme.chipBorder};
    color: inherit;
    border-radius: 8px;
    padding: 0.25rem 0.65rem;
    font-family: monospace;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(10, 185, 194, 0.15);
      border-color: #0ab9c2;
      color: #0ab9c2;
    }
  }
`;

// Ticket Result Card
const ResultBox = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.08)" : "#f0fdfa")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.25)" : "rgba(13, 148, 136, 0.25)")};
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;

  .guest-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .guest-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: inherit;
    }

    .event-info {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.textMuted};

      code {
        background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)")};
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
      }
    }

    .status-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      width: fit-content;

      &.checked {
        background: rgba(46, 204, 113, 0.15);
        color: #16a34a;
        border: 1px solid rgba(46, 204, 113, 0.3);
      }

      &.not-checked {
        background: rgba(243, 156, 18, 0.15);
        color: #d97706;
        border: 1px solid rgba(243, 156, 18, 0.3);
      }
    }
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

const ResultActionBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0ab9c2;
  color: #041216;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(10, 185, 194, 0.4);
  }
`;

const ErrorText = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(231, 76, 60, 0.12);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 10px;
  color: #e74c3c;
  font-size: 0.9rem;
`;

// Section Header
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  .left {
    .sub {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
      margin-bottom: 0.35rem;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: -0.02em;
      margin: 0;
      color: ${({ theme }) => theme.text};
    }
  }

  .view-all {
    color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: opacity 0.2s;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Events Grid
const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 1.5rem;
  margin-bottom: 4.5rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

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

const EventCoverWrapper = styled.div`
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

const EventCoverImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${EventCard}:hover & {
    transform: scale(1.06);
  }
`;

const EventStatusBadge = styled.div`
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

const EventDateChip = styled.div`
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

const EventCardBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;

  @media (max-width: 480px) {
    padding: 1.15rem 1rem;
  }
`;

const EventTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
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
  }
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 1.25rem;

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .icon {
      flex-shrink: 0;
      opacity: 0.85;
    }
  }

  .template-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.65rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 700;
    width: fit-content;
    margin-top: 0.2rem;
    background: ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.12)" : "rgba(124, 58, 237, 0.08)")};
    border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.3)" : "rgba(124, 58, 237, 0.25)")};
    color: ${({ theme }) => (theme.isDark ? "#c084fc" : "#7c3aed")};
  }
`;

const EventBtnPrimary = styled(Link)`
  flex: 1;
  text-align: center;
  text-decoration: none;
  background: rgba(10, 185, 194, 0.15);
  color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
  border: 1px solid rgba(10, 185, 194, 0.3);
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.2s;

  &:hover {
    background: #0ab9c2;
    color: #041216;
  }
`;

const EventBtnPreview = styled(Link)`
  text-align: center;
  text-decoration: none;
  background: ${({ theme }) => theme.previewBtnBg};
  color: inherit;
  border: 1px solid ${({ theme }) => theme.previewBtnBorder};
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.14)" : "#f1f5f9")};
    border-color: rgba(10, 185, 194, 0.4);
  }
`;

// Features Showcase
const FeaturesSection = styled.section`
  margin: 4.5rem 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  backdrop-filter: blur(14px);
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(170, 59, 255, 0.45);
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff")};
    box-shadow: ${({ theme }) => theme.cardShadowHover};
  }
`;

const FeatureImgWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #0f172a;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%);
  }

  @media (max-width: 480px) {
    height: 160px;
  }
`;

const FeatureImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${FeatureCard}:hover & {
    transform: scale(1.08);
  }
`;

const FeatureBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #f8fafc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const FeatureContent = styled.div`
  padding: 1.5rem 1.6rem 1.75rem;
  display: flex;
  flex-direction: column;
  flex: 1;

  h3 {
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0 0 0.65rem 0;
    color: ${({ theme }) => theme.text};
    letter-spacing: -0.01em;
    transition: color 0.2s ease;

    ${FeatureCard}:hover & {
      color: #0ab9c2;
    }
  }

  p {
    font-size: 0.92rem;
    line-height: 1.6;
    margin: 0 0 1.25rem 0;
    color: ${({ theme }) => theme.textMuted};
    flex: 1;
  }

  .tag-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: auto;

    span {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)")};
      border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};
      color: ${({ theme }) => theme.textMuted};
    }
  }
`;

// Interactive E-Invitation Spotlight Section
const ShowcaseSection = styled.section`
  margin: 5rem 0;
  padding: 3rem;
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(10, 185, 194, 0.03) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)"};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 28px;
  backdrop-filter: blur(20px);
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 20px 50px rgba(0, 0, 0, 0.3)" : "0 10px 35px rgba(0, 0, 0, 0.05)"};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
  }
`;

const ShowcaseContent = styled.div`
  .pill {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${({ theme }) => (theme.isDark ? "#aa3bff" : "#7c3aed")};
    background: ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.12)" : "rgba(124, 58, 237, 0.1)")};
    border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(170, 59, 255, 0.25)" : "rgba(124, 58, 237, 0.25)")};
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    line-height: 1.2;
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.text};
  }

  p {
    font-size: 1rem;
    line-height: 1.65;
    color: ${({ theme }) => theme.textMuted};
    margin-bottom: 1.75rem;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      color: ${({ theme }) => theme.text};

      .check {
        color: ${({ theme }) => (theme.isDark ? "#0ab9c2" : "#0891b2")};
        font-weight: 700;
      }
    }
  }
`;

const PhoneMockup = styled.div`
  background: #1c1813;
  border: 4px solid #3b2c1c;
  border-radius: 36px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  max-width: 320px;
  margin: 0 auto;
  padding: 1.75rem 1.25rem;
  color: #f7e6c3;
  position: relative;
  overflow: hidden;
  text-align: center;
  animation: ${float} 6s ease-in-out infinite;

  .notch {
    width: 90px;
    height: 16px;
    background: #000;
    border-radius: 0 0 12px 12px;
    margin: -1.75rem auto 1.25rem;
  }

  .card-inner {
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
  }

  .card-tag {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #d4af37;
    margin-bottom: 0.5rem;
  }

  .card-title {
    font-size: 1.15rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    color: #fff;
  }

  .card-guest {
    font-size: 0.85rem;
    opacity: 0.85;
    margin-bottom: 1.25rem;
  }

  .qr-box {
    background: #fff;
    padding: 0.6rem;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 1.25rem;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);

    svg {
      display: block;
    }
  }

  .live-pill {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
    color: #2ecc71;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2ecc71;
    }
  }
`;

// Steps Workflow
const StepsSection = styled.section`
  margin: 5rem 0;
  text-align: center;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
`;

const StepCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 20px;
  padding: 2rem 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  position: relative;
  text-align: left;

  .step-num {
    font-size: 2.5rem;
    font-weight: 900;
    background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, #0ab9c2, #aa3bff)"
      : "linear-gradient(135deg, #0891b2, #7c3aed)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.15rem;
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.text};
  }

  p {
    font-size: 0.9rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.textMuted};
    margin: 0;
  }
`;

// Bottom CTA Banner
const BannerSection = styled.section`
  margin: 5rem 0 2rem;
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(135deg, rgba(10, 185, 194, 0.15) 0%, rgba(170, 59, 255, 0.15) 100%)"
      : "linear-gradient(135deg, #ecfeff 0%, #f5f3ff 100%)"};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(10, 185, 194, 0.3)" : "rgba(8, 145, 178, 0.25)")};
  border-radius: 28px;
  padding: 3.5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 20px 50px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.04)"};

  h2 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.text};
  }

  p {
    font-size: 1.1rem;
    max-width: 650px;
    margin: 0 auto 2rem;
    color: ${({ theme }) => theme.textMuted};
    line-height: 1.6;
  }
`;

// Footer
const Footer = styled.footer`
  margin-top: 5rem;
  padding-top: 3rem;
  border-top: 1px solid ${({ theme }) => theme.divider};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.textMuted};

  .logo-text {
    font-weight: 700;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.text};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(46, 204, 113, 0.1);
    color: ${({ theme }) => (theme.isDark ? "#2ecc71" : "#16a34a")};
    font-weight: 600;
    font-size: 0.8rem;
  }
`;

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickCode, setQuickCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events");
        setEvents(res.data || []);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleLookup = async (e) => {
    e?.preventDefault?.();
    const code = quickCode.trim();
    if (!code) return;

    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      // 1. Check direct lookup endpoint
      try {
        const res = await axios.get(`/api/guests/lookup/${encodeURIComponent(code)}`);
        if (res.data) {
          setSearchResult(res.data);
          setSearching(false);
          return;
        }
      } catch {
        // Fallback to guest endpoint if code looks like ID
      }

      // 2. Check direct guest ID
      try {
        const res = await axios.get(`/api/guests/guest/${encodeURIComponent(code)}`);
        if (res.data) {
          setSearchResult(res.data);
          setSearching(false);
          return;
        }
      } catch {
        // Continue fallback search
      }

      // 3. Fallback: Search across guests of all events
      let found = null;
      for (const ev of events) {
        try {
          const res = await axios.get(`/api/guests/${ev._id}`);
          const guests = res.data || [];
          const match = guests.find(
            (g) =>
              g.shortCode?.toUpperCase() === code.toUpperCase() ||
              g.qrToken === code ||
              g._id === code,
          );
          if (match) {
            found = { ...match, eventId: ev };
            break;
          }
        } catch {
          // ignore individual event fetch errors
        }
      }

      if (found) {
        setSearchResult(found);
      } else {
        setSearchError("Không tìm thấy thông tin vé với mã: " + code + ". Vui lòng kiểm tra lại!");
      }
    } catch {
      setSearchError("Lỗi trong quá trình tra cứu. Vui lòng thử lại!");
    } finally {
      setSearching(false);
    }
  };

  const scrollToLookup = () => {
    const el = document.getElementById("lookup-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Select sample event for preview
  const firstEventId = events[0]?._id;

  return (
    <PageWrapper>
      <AmbientBlob className="top-right" />
      <AmbientBlob className="mid-left" />
      <AmbientBlob className="bottom-right" />

      <ContentContainer>
        {/* HERO SECTION */}
        <HeroSection>
          <Badge>
            <span className="dot" />
            Nền Tảng Quản Lý Sự Kiện &amp; Check-in QR Thông Minh
          </Badge>

          <HeroTitle>
            Tổ Chức Sự Kiện Đẳng Cấp <br />
            <span className="gradient-text">Kết Nối &amp; Check-in Trong 1 Giây</span>
          </HeroTitle>

          <HeroSubtitle>
            Giải pháp số hóa sự kiện toàn diện: Phát hành thiệp mời điện tử cá nhân hóa sang trọng,
            điều phối lịch trình thời gian thực (Realtime Timeline) và trạm soát vé QR
            thần tốc.
          </HeroSubtitle>

          <HeroButtonGroup>
            <PrimaryBtn to="/admin/events">
              Khám Phá Sự Kiện ➔
            </PrimaryBtn>
            <SecondaryBtn onClick={scrollToLookup}>
              Tra Cứu Vé &amp; Khách Mời
            </SecondaryBtn>
            <OutlineBtn to="/admin/login">
              Đăng Nhập Ban Tổ Chức
            </OutlineBtn>
          </HeroButtonGroup>

          {/* METRICS ROW */}
          <MetricsGrid>
            <MetricCard>
              <div className="icon-box speed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
              <div>
                <p className="num">&lt; 1 Giây</p>
                <p className="desc">Tốc độ quét mã QR Check-in</p>
              </div>
            </MetricCard>

            <MetricCard>
              <div className="icon-box realtime">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                  <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path d="M12 14v7" strokeWidth="2.2" />
                </svg>
              </div>
              <div>
                <p className="num">Realtime</p>
                <p className="desc">Đồng bộ lịch trình realtime</p>
              </div>
            </MetricCard>

            <MetricCard>
              <div className="icon-box vip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 12V7a2 2 0 0 0-2-2H4.5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
                  <circle cx="17.5" cy="17.5" r="3.5" fill="currentColor" fillOpacity="0.2" />
                  <path d="m16 17.5 1 1 2-2" strokeWidth="2.2" />
                  <path d="m3 6 9 6 9-6" />
                </svg>
              </div>
              <div>
                <p className="num">100% VIP</p>
                <p className="desc">Thư mời điện tử cá nhân hóa</p>
              </div>
            </MetricCard>

            <MetricCard>
              <div className="icon-box shield">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.18" />
                  <path d="m9 12 2 2 4-4" strokeWidth="2.4" />
                </svg>
              </div>
              <div>
                <p className="num">Chính Xác</p>
                <p className="desc">Ngăn chặn vé giả &amp; trùng lặp</p>
              </div>
            </MetricCard>
          </MetricsGrid>
        </HeroSection>

        {/* QUICK LOOKUP & CHECK-IN TOOL */}
        <LookupSection id="lookup-section">
          <LookupCard>
            <LookupHeader>
              <div>
                <h2>Tra Cứu Vé Mời &amp; Điểm Danh Nhanh</h2>
                <p>
                  Nhập mã khách mời (Short Code) hoặc mã vé cá nhân để xem thiệp mời và thông tin check-in.
                </p>
              </div>
              <PrimaryBtn
                to={firstEventId ? `/guest/preview/${firstEventId}` : "/admin/events"}
                style={{ fontSize: "0.88rem", padding: "0.6rem 1.25rem" }}
              >
                Demo
              </PrimaryBtn>
            </LookupHeader>

            <LookupForm onSubmit={handleLookup}>
              <LookupInput
                placeholder="Nhập mã vé (VD: 73C4E9, 6DA412, B30803...)"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
              />
              <LookupSubmitBtn type="submit" disabled={searching}>
                {searching ? "Đang tra cứu..." : "Tra Cứu Vé"}
              </LookupSubmitBtn>
            </LookupForm>

            <ChipsRow>
              <span className="label">Mã thử nhanh:</span>
              <button type="button" onClick={() => { setQuickCode("73C4E9"); }}>
                73C4E9
              </button>
              <button type="button" onClick={() => { setQuickCode("6DA412"); }}>
                6DA412
              </button>
              <button type="button" onClick={() => { setQuickCode("B30803"); }}>
                B30803
              </button>
            </ChipsRow>

            {searchError && <ErrorText>{searchError}</ErrorText>}

            {searchResult && (
              <ResultBox>
                <div className="guest-info">
                  <div className="guest-name">
                    👤 {searchResult.name}
                  </div>
                  <div className="event-info">
                    Sự kiện: <strong>{searchResult.eventId?.title || "Sự kiện được chỉ định"}</strong> • Mã: <code>{searchResult.shortCode}</code>
                  </div>
                  <div
                    className={`status-tag ${searchResult.checkedIn ? "checked" : "not-checked"
                      }`}
                  >
                    {searchResult.checkedIn ? "✓ Đã Điểm Danh Check-in" : "⏳ Chưa Check-in (Vé Hợp Lệ)"}
                  </div>
                </div>

                <div className="actions">
                  <ResultActionBtn to={`/guest/${searchResult._id}`}>
                    💌 Mở Thiệp Mời Điện Tử ➔
                  </ResultActionBtn>
                  {searchResult.eventId?._id && (
                    <SecondaryBtn
                      style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem" }}
                      onClick={() => navigate(`/admin/events/${searchResult.eventId._id}`)}
                    >
                      Bàn Quản Lý
                    </SecondaryBtn>
                  )}
                </div>
              </ResultBox>
            )}
          </LookupCard>
        </LookupSection>

        {/* LIVE EVENTS SHOWCASE */}
        <SectionHeader>
          <div className="left">
            <div className="sub">Sự Kiện Đang Triển Khai</div>
            <h2>Sự Kiện Nổi Bật &amp; Sắp Diễn Ra</h2>
          </div>
          <Link to="/admin/events" className="view-all">
            Xem tất cả sự kiện ({events.length}) ➔
          </Link>
        </SectionHeader>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
            Đang tải dữ liệu sự kiện...
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
            Chưa có sự kiện nào. Hãy bắt đầu bằng cách tạo sự kiện mới!
          </div>
        ) : (
          <EventsGrid>
            {events.slice(0, 6).map((ev) => {
              const status = getEventStatus(ev.date);
              const template = getTemplateById(ev.invitationTemplate || "classic-navy");
              return (
                <EventCard key={ev._id}>
                  <EventCoverWrapper>
                    <EventCoverImg
                      src={getEventCover(ev)}
                      alt={ev.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <EventStatusBadge $tone={status.tone}>
                      <span className="badge-dot" />
                      {status.label}
                    </EventStatusBadge>
                    <EventDateChip>
                      {new Date(ev.date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </EventDateChip>
                  </EventCoverWrapper>

                  <EventCardBody>
                    <div>
                      <EventTitle>{ev.title}</EventTitle>
                      <EventMeta>
                        <div className="meta-row">
                          <span className="icon">🕒</span>
                          <span>
                            {new Date(ev.date).toLocaleDateString("vi-VN", {
                              weekday: "short",
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {ev.location && (
                          <div className="meta-row">
                            <span className="icon">📍</span>
                            <span>{ev.location}</span>
                          </div>
                        )}
                        {ev.schedule?.length > 0 && (
                          <div className="meta-row">
                            <span className="icon">📋</span>
                            <span>{ev.schedule.length} tiết mục lịch trình</span>
                          </div>
                        )}
                      </EventMeta>
                    </div>

                    <div className="card-actions" style={{ marginTop: "auto" }}>
                      {/* <EventBtnPrimary to={`/admin/events/${ev._id}`}>
                        Quản Lý Sự Kiện ➔
                      </EventBtnPrimary> */}
                      <EventBtnPreview to={`/guest/preview/${ev._id}`}>
                        Xem Thiệp
                      </EventBtnPreview>
                    </div>
                  </EventCardBody>
                </EventCard>
              );
            })}
          </EventsGrid>
        )}

        {/* CORE FEATURES SECTION */}
        <FeaturesSection>
          <SectionHeader>
            <div className="left">
              <div className="sub">Giải Pháp Công Nghệ</div>
              <h2>Hệ Sinh Thái Sự Kiện Toàn Diện</h2>
            </div>
          </SectionHeader>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureImgWrapper>
                <FeatureImg
                  src="/features/feature_invitation.jpg"
                  alt="Thư Mời Điện Tử VIP"
                  loading="lazy"
                />
                <FeatureBadge>
                  <span>✨</span> Cá Nhân Hóa VIP
                </FeatureBadge>
              </FeatureImgWrapper>
              <FeatureContent>
                <h3>Thư Mời Điện Tử VIP</h3>
                <p>
                  Thiệp mời số sang trọng chuẩn phong cách sự kiện (Gala, Thể thao, Doanh nghiệp...) với mã QR và đường link riêng biệt cho từng vị khách.
                </p>
                <div className="tag-pills">
                  <span>Mã QR cá nhân</span>
                  <span>Phong cách đa dạng</span>
                  <span>Tối ưu Mobile</span>
                </div>
              </FeatureContent>
            </FeatureCard>

            <FeatureCard>
              <FeatureImgWrapper>
                <FeatureImg
                  src="/features/feature_checkin.jpg"
                  alt="Check-in QR Siêu Tốc"
                  loading="lazy"
                />
                <FeatureBadge>
                  <span>⚡</span> &lt; 1 Giây / Khách
                </FeatureBadge>
              </FeatureImgWrapper>
              <FeatureContent>
                <h3>Check-in QR Siêu Tốc</h3>
                <p>
                  Quét mã tức thì qua camera điện thoại hoặc máy đọc mã vạch. Ngăn ngừa vé giả mạo, trùng lặp và xóa bỏ cảnh xếp hàng ùn ứ tại quầy lễ tân.
                </p>
                <div className="tag-pills">
                  <span>Quét dưới 1s</span>
                  <span>Chống vé trùng</span>
                  <span>Short Code 6 ký tự</span>
                </div>
              </FeatureContent>
            </FeatureCard>

            <FeatureCard>
              <FeatureImgWrapper>
                <FeatureImg
                  src="/features/feature_timeline.jpg"
                  alt="Timeline Realtime Sync"
                  loading="lazy"
                />
                <FeatureBadge>
                  <span>📡</span> Live Broadcast
                </FeatureBadge>
              </FeatureImgWrapper>
              <FeatureContent>
                <h3>Timeline Realtime Sync</h3>
                <p>
                  Đồng bộ lịch trình tức thì qua WebSocket. Khi ban tổ chức chuyển tiết mục tiếp theo, điện thoại của toàn bộ khách mời sẽ tự động chuyển trạng thái trực tiếp.
                </p>
                <div className="tag-pills">
                  <span>Socket.io Realtime</span>
                  <span>Thông báo tức thì</span>
                  <span>Không cần F5</span>
                </div>
              </FeatureContent>
            </FeatureCard>

            <FeatureCard>
              <FeatureImgWrapper>
                <FeatureImg
                  src="/features/feature_analytics.jpg"
                  alt="Thống Kê Điểm Danh Sống"
                  loading="lazy"
                />
                <FeatureBadge>
                  <span>📊</span> Dữ Liệu Thời Gian Thực
                </FeatureBadge>
              </FeatureImgWrapper>
              <FeatureContent>
                <h3>Thống Kê Điểm Danh Sống</h3>
                <p>
                  Theo dõi trực quan tỷ lệ khách đã có mặt, tốc độ check-in theo khung giờ và danh sách khách VIP đã đến, giúp điều phối tiệc và nhân sự chu đáo.
                </p>
                <div className="tag-pills">
                  <span>Báo cáo thời gian thực</span>
                  <span>Tỷ lệ có mặt</span>
                  <span>Quản lý khách VIP</span>
                </div>
              </FeatureContent>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        {/* INTERACTIVE E-INVITATION SPOTLIGHT */}
        <ShowcaseSection>
          <ShowcaseContent>
            <span className="pill">Trải Nghiệm Khách Mời</span>
            <h2>Thiệp Mời Điện Tử Tương Tác Sống Động</h2>
            <p>
              Khách mời không chỉ nhận một tấm thiệp thông thường, mà là một cổng thông tin sự kiện trực tuyến sống động ngay trong lòng bàn tay.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Mã QR cá nhân hóa tích hợp sẵn cho khâu kiểm soát cửa
              </li>
              <li>
                <span className="check">✓</span>
                Trạng thái tiết mục nhảy trực tiếp (Realtime Live Broadcast)
              </li>
              <li>
                <span className="check">✓</span>
                Tra cứu bản đồ địa điểm và timeline chi tiết dễ dàng
              </li>
              <li>
                <span className="check">✓</span>
                Hiệu ứng chuyển cảnh mượt mà, đậm chất sự kiện cao cấp
              </li>
            </ul>

            <PrimaryBtn
              to={firstEventId ? `/guest/preview/${firstEventId}` : "/admin/events"}
            >
              Trải Nghiệm Thiệp Mời Thực Tế ➔
            </PrimaryBtn>
          </ShowcaseContent>

          <div>
            <PhoneMockup>
              <div className="notch" />
              <div className="card-inner">
                <div className="card-tag">VIP INVITATION</div>
                <div className="card-title">
                  {events[0]?.title || "Giải Đấu Thể Thao 2026"}
                </div>
                <div className="card-guest">
                  Kính mời: <strong>Quý Khách Danh Dự</strong>
                </div>

                <div className="qr-box">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="#1c1813">
                    <rect width="28" height="28" x="6" y="6" />
                    <rect width="16" height="16" x="12" y="12" fill="#fff" />
                    <rect width="8" height="8" x="16" y="16" />
                    <rect width="28" height="28" x="66" y="6" />
                    <rect width="16" height="16" x="72" y="12" fill="#fff" />
                    <rect width="8" height="8" x="76" y="16" />
                    <rect width="28" height="28" x="6" y="66" />
                    <rect width="16" height="16" x="12" y="72" fill="#fff" />
                    <rect width="8" height="8" x="16" y="76" />
                    <rect width="8" height="8" x="46" y="16" />
                    <rect width="8" height="8" x="46" y="46" />
                    <rect width="8" height="8" x="76" y="46" />
                    <rect width="8" height="8" x="16" y="46" />
                    <rect width="8" height="8" x="46" y="76" />
                    <rect width="8" height="8" x="76" y="76" />
                  </svg>
                </div>

                <br />
                <div className="live-pill">
                  <span className="dot" />
                  TIẾT MỤC ĐANG DIỄN RA
                </div>
              </div>
            </PhoneMockup>
          </div>
        </ShowcaseSection>

        {/* 3-STEP WORKFLOW */}
        <StepsSection>
          <SectionHeader style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <div className="sub" style={{ color: "#0ab9c2" }}>Quy Trình Triển Khai</div>
              <h2>3 Bước Vận Hành Tối Giản</h2>
            </div>
          </SectionHeader>

          <StepsGrid>
            <StepCard>
              <div className="step-num">01</div>
              <h4>Khởi Tạo &amp; Lên Lịch Trình</h4>
              <p>
                Thiết lập thông tin sự kiện, địa điểm và soạn thảo các mốc thời gian chi tiết của chương trình trong giao diện trực quan.
              </p>
            </StepCard>

            <StepCard>
              <div className="step-num">02</div>
              <h4>Phát Hành Thiệp &amp; Mã QR</h4>
              <p>
                Hệ thống tự động cấp mã định danh Short Code và sinh link thiệp mời điện tử riêng biệt cho từng vị khách.
              </p>
            </StepCard>

            <StepCard>
              <div className="step-num">03</div>
              <h4>Check-in &amp; Điều Phối Trực Tiếp</h4>
              <p>
                Quét mã tại sảnh đón khách chỉ trong 1 giây và kích hoạt các tiết mục trực tiếp đến điện thoại khách mời theo thời gian thực.
              </p>
            </StepCard>
          </StepsGrid>
        </StepsSection>

        {/* BOTTOM CTA BANNER */}
        <BannerSection>
          <h2>Sẵn Sàng Nâng Tầm Sự Kiện Tiếp Theo?</h2>
          <p>
            Khởi tạo sự kiện của bạn ngay hôm nay và trải nghiệm giải pháp check-in thông minh cùng thư mời điện tử sang trọng.
          </p>
          <PrimaryBtn to="/admin/events" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
            Tạo Sự Kiện Mới Ngay ➔
          </PrimaryBtn>
        </BannerSection>

        {/* FOOTER */}
        <Footer>
          <div className="logo-text">
            <span>⚡</span> Events • Nền tảng Sự kiện &amp; Check-in QR
          </div>
          <div className="status-pill">
            <span>●</span> WebSocket Realtime Sync: Hoạt động ổn định
          </div>
          <div>© {new Date().getFullYear()} All rights reserved.</div>
        </Footer>
      </ContentContainer>
    </PageWrapper>
  );
}
