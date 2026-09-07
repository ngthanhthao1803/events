import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled, { keyframes, css } from "styled-components";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";
import {
  INVITATION_TEMPLATES,
  getTemplateById,
  detectSuggestedTemplate,
} from "../utils/invitationTemplates";

// Animations
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { 
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
  }
  50% { 
    transform: scale(1.03);
    filter: drop-shadow(0 0 16px rgba(212, 175, 55, 0.8));
  }
  100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
  }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

// Outer desktop wrapper
const OuterWrapper = styled.div`
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ $theme }) => $theme.outerBg};
  transition: background 0.4s ease;
`;

// Main Mobile-First Full-Screen Invitation Page
const Page = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: calc(100svh - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.25rem 1rem 3.5rem;
  overflow-x: hidden;
  box-sizing: border-box;

  /* Rich Graphic Background Image */
  background-color: ${({ $theme }) => $theme.cardBg};
  background-image: url("${({ $theme }) => $theme.bgImage}");
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;

  color: ${({ $theme }) => $theme.primaryColor};
  font-family: ${({ $theme }) => $theme.fontBody};
  box-shadow: 0 0 35px rgba(0, 0, 0, 0.6);
  transition: background 0.4s ease;
`;

// Top Logos Header (Original Tân Dân 30 Years)
const Logos = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 0 6px;

  img.logo1 {
    height: 44px;
    object-fit: contain;
  }
  img.logo2 {
    height: 32px;
    object-fit: contain;
  }
  img.logo3 {
    height: 40px;
    object-fit: contain;
  }
`;

// Top Luxury Badge for other themes
const TopBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.35rem 0.95rem;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${({ $theme }) => $theme.borderColor};
  color: ${({ $theme }) => $theme.accentColor};
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: min(100%, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0;
  animation: ${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  padding-bottom: 2rem;
`;

// Card Main Title: "Thư Mời"
const ThuMoi = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.1;

  ${({ $theme }) =>
    $theme.id === "classic-gold"
      ? css`
          font-family: "Times New Roman", serif;
          font-size: 3.8rem;
          font-weight: 700;
          color: #fffaea;
          -webkit-text-stroke: 1px #a87932;
          text-shadow:
            -1px 1px 0 #8f611f,
            -2px 2px 0 #7d5115,
            -3px 3px 0 #66400c,
            -4px 4px 0 #523105,
            -5px 5px 10px rgba(0, 0, 0, 0.5);
        `
      : $theme.id === "luxury-gala"
        ? css`
          font-family: "Playfair Display", Georgia, serif;
          font-size: 3.4rem;
          font-weight: 800;
          color: #fffbeb;
          letter-spacing: 0.08em;
          text-shadow: 0 3px 18px rgba(212, 175, 55, 0.6);
        `
        : $theme.id === "crimson-opening"
          ? css`
          font-family: "Playfair Display", Georgia, serif;
          font-size: 3.4rem;
          font-weight: 800;
          color: #fef08a;
          letter-spacing: 0.06em;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
        `
          : $theme.id === "modern-sports"
            ? css`
          font-family: "Montserrat", sans-serif;
          font-size: 3rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-shadow: 0 3px 14px rgba(0, 0, 0, 0.8);
        `
            : css`
          font-family: "Playfair Display", Georgia, serif;
          font-size: 2.8rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.12em;
        `}
`;

// Subtitle: "Trân trọng kính mời"
const Subtitle = styled.div`
  font-size: 1.05rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
  color: ${({ $theme }) => $theme.subColor};
`;

// Guest Name: Tên khách mời
const GuestName = styled.h3`
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ $theme }) => $theme.primaryColor};
  font-family: ${({ $theme }) => $theme.fontHeading};
`;

// Divider Line
const Divider = styled.div`
  width: 100%;
  max-width: 380px;
  margin: 0.25rem auto 0.75rem;

  img {
    width: 100%;
    max-width: 380px;
    object-fit: contain;
    display: block;
  }

  .ornamental-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ $theme }) => $theme.borderColor} 50%,
      transparent 100%
    );
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.75rem 0;

    &::after {
      content: "✦";
      position: absolute;
      padding: 0 6px;
      font-size: 0.75rem;
      color: ${({ $theme }) => $theme.accentColor};
    }
  }
`;

// Event Info Block
const EventInfo = styled.div`
  margin: 0.5rem 0;
  text-transform: uppercase;
  line-height: 1.45;

  .pretext {
    font-size: 0.85rem;
    font-weight: 500;
    color: ${({ $theme }) => $theme.subColor};
    margin-bottom: 0.25rem;
  }

  .title {
    font-size: 1.7rem;
    font-weight: 900;
    margin-bottom: 0.35rem;
    letter-spacing: 0.04em;
    line-height: 1.25;
    color: ${({ $theme }) => $theme.titleColor};
    font-family: ${({ $theme }) => $theme.fontHeading};

    ${({ $theme }) =>
    $theme.id === "classic-gold" &&
    css`
        color: #fff;
        -webkit-text-stroke: 1px #c59346;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
      `}
  }

  .desc {
    font-size: 0.84rem;
    max-width: 350px;
    margin: 0 auto;
    font-weight: 700;
    line-height: 1.45;
    color: ${({ $theme }) => $theme.subColor};
  }
`;

// Event Time & Date Box (Original Tan Dan Structure)
const EventTimeLoc = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin: 0.8rem 0 0.3rem 0;

  .time {
    font-size: 2.6rem;
    font-weight: 700;
    line-height: 1;
    color: ${({ $theme }) =>
    $theme.id === "classic-gold" ? "#8a4b08" : $theme.primaryColor};
    font-family: ${({ $theme }) => $theme.fontHeading};
  }

  .divider {
    width: 2px;
    height: 38px;
    background: ${({ $theme }) => $theme.accentColor};
    opacity: 0.8;
  }

  .date {
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.15;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: ${({ $theme }) =>
    $theme.id === "classic-gold" ? "#8a4b08" : $theme.primaryColor};
    font-family: ${({ $theme }) => $theme.fontHeading};
  }
`;

// Venue Location Bar
const LocationText = styled.div`
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.35rem;
  margin-bottom: 0.75rem;
  color: ${({ $theme }) => $theme.primaryColor};
  max-width: 380px;
  line-height: 1.4;
`;

// Center Artwork Graphic (Ball / Trophy / Ribbon / Monogram)
const CenterGraphic = styled.img`
  width: 100%;
  max-width: 250px;
  max-height: 250px;
  object-fit: contain;
  margin: 0.4rem 0;
  animation: ${pulseGlow} 3.2s ease-in-out infinite;
  transform-origin: bottom center;

  ${({ $isRounded }) =>
    $isRounded &&
    css`
      border-radius: 50%;
      border: 3px solid rgba(212, 175, 55, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `}
`;

// Confirmation Button (Matches original button.png or custom styled)
const ConfirmBtn = styled.button`
  width: 260px;
  height: 54px;
  border: none;
  cursor: pointer;
  margin-top: 0.85rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${({ $theme }) =>
    $theme.buttonImage
      ? css`
          background-image: url("${$theme.buttonImage}");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
          background-color: transparent;
          color: #4e250d;
        `
      : css`
          background: linear-gradient(135deg, ${$theme.accentColor} 0%, #b45309 100%);
          color: #0c0a09;
          border-radius: 999px;
          border: 1.5px solid #fef08a;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        `}

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

// QR Code Container
const QRContainer = styled.div`
  margin: 1.5rem 0 1rem;
  padding: 4px;
  background: #ffffff;
  border: 4px solid ${({ $theme }) => $theme.accentColor};
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

  img {
    width: 150px;
    height: 150px;
    display: block;
  }
`;

const InstructionText = styled.p`
  font-size: 0.86rem;
  max-width: 340px;
  margin: 0.2rem auto 0.75rem;
  font-weight: 600;
  color: ${({ $theme }) => $theme.subColor};
  line-height: 1.45;
`;

// Lucky Number Box
const LuckyNumber = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${({ $theme }) => $theme.subColor};
  margin: 0.6rem 0;

  .num {
    font-size: 2.8rem;
    font-weight: 900;
    color: ${({ $theme }) => $theme.accentColor};
    font-family: ${({ $theme }) => $theme.fontHeading};
    letter-spacing: 0.08em;
    line-height: 1;
    margin-top: 0.2rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  }
`;

// Realtime Event Schedule Drawer
const ScheduleList = styled.div`
  width: 100%;
  max-width: 380px;
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $theme }) => $theme.borderColor};
  border-radius: 16px;
  padding: 0.85rem;
  box-sizing: border-box;
  text-align: left;

  .header {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ $theme }) => $theme.accentColor};
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .toggle-button {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 4px;
    color: ${({ $theme }) => $theme.accentColor};
    font-size: 0.8rem;
    font-weight: bold;
  }

  .schedule-items {
    max-height: 1000px;
    opacity: 1;
    overflow: hidden;
    transition: max-height 0.4s ease, opacity 0.3s ease;
    margin-top: 0.4rem;

    &.closed {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      pointer-events: none;
    }
  }

  .item {
    display: flex;
    align-items: center;
    margin-bottom: 0.4rem;
    font-size: 0.86rem;
    color: ${({ $theme }) => $theme.primaryColor};
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 6px 10px;

    &.active {
      border: 1px solid ${({ $theme }) => $theme.accentColor};
      background: rgba(255, 255, 255, 0.15);
      font-weight: 800;

      .time {
        color: ${({ $theme }) => $theme.accentColor};
      }
    }

    .content-box {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .time {
      font-weight: 800;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .label {
      flex: 1;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: ${livePulse} 1.4s infinite;
      margin-left: 6px;
    }
  }
`;

// Countdown Section
const CountdownShell = styled.div`
  display: flex;
  gap: 0.6rem;
  margin: 0.8rem 0;

  .count-box {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid ${({ $theme }) => $theme.borderColor};
    border-radius: 10px;
    padding: 0.55rem 0.75rem;
    min-width: 52px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 1.3rem;
      font-weight: 800;
      color: ${({ $theme }) => $theme.accentColor};
      font-family: ${({ $theme }) => $theme.fontHeading};
      line-height: 1;
    }
    .lbl {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      color: ${({ $theme }) => $theme.subColor};
      margin-top: 0.2rem;
    }
  }
`;

// Floating Template Switcher (For Organizers in Preview Mode)
const FloatingSwitcher = styled.div`
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 0.45rem 0.65rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 96vw;
  overflow-x: auto;

  .switcher-label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    padding-left: 0.4rem;
    white-space: nowrap;
  }
`;

const SwitcherPill = styled.button`
  border: none;
  background: ${({ $active }) =>
    $active ? "linear-gradient(135deg, #0ab9c2, #2ec4ff)" : "rgba(255, 255, 255, 0.08)"};
  color: ${({ $active }) => ($active ? "#041216" : "#f8fafc")};
  font-weight: 700;
  font-size: 0.76rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) =>
    $active ? "linear-gradient(135deg, #0ab9c2, #2ec4ff)" : "rgba(255, 255, 255, 0.18)"};
  }
`;

const SaveTemplateBtn = styled.button`
  border: none;
  background: #16a34a;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.76rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #15803d;
  }
`;

const DEFAULT_SCHEDULE = [
  { time: "07:00", label: "Tập trung đón khách", isActive: true },
  { time: "07:30", label: "Khai mạc chương trình", isActive: false },
  { time: "08:00", label: "Tiết mục mở màn & Diễn văn", isActive: false },
  { time: "09:00", label: "Nội dung chính sự kiện", isActive: false },
  { time: "11:30", label: "Khen thưởng & Trao giải", isActive: false },
  { time: "12:00", label: "Dạ tiệc giao lưu", isActive: false },
  { time: "14:00", label: "Bế mạc & Chụp hình lưu niệm", isActive: false },
];

function CountdownView({ targetDate, theme }) {
  const [timeLeft, setTimeLeft] = useState(calc());

  function calc() {
    const diff = +new Date(targetDate) - +new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
    };
  }

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calc()), 30000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <CountdownShell $theme={theme}>
      <div className="count-box">
        <span className="num">{timeLeft.days}</span>
        <span className="lbl">Ngày</span>
      </div>
      <div className="count-box">
        <span className="num">{timeLeft.hours}</span>
        <span className="lbl">Giờ</span>
      </div>
      <div className="count-box">
        <span className="num">{timeLeft.minutes}</span>
        <span className="lbl">Phút</span>
      </div>
    </CountdownShell>
  );
}

export default function GuestView({ isPreview = false }) {
  const { guestId, eventId } = useParams();
  const [guest, setGuest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(() => {
    return localStorage.getItem(`confirmed_${guestId}`) === "true";
  });

  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    let socketInstance = null;
    let isMounted = true;

    if (isPreview) {
      const fetchPreview = async () => {
        try {
          const res = await axios.get(`/api/events/${eventId}`);
          if (!isMounted) return;
          const ev = res.data;
          setGuest({
            _id: "preview-id",
            name: "Nguyễn Văn Khách",
            guestIndex: "08",
            eventId: ev,
            qrDataUrl:
              "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=preview-pass&color=0f172a&bgcolor=ffffff",
          });

          setActiveTemplateId(ev.template || detectSuggestedTemplate(ev.title, ev.description));

          if (eventId) {
            socketInstance = io(getSocketUrl());
            socketInstance.emit("joinEvent", eventId.toString());
            socketInstance.on("eventUpdated", (updatedEvent) => {
              if (updatedEvent?._id?.toString() === eventId?.toString()) {
                setGuest((prev) =>
                  prev
                    ? {
                      ...prev,
                      eventId: {
                        ...(typeof prev.eventId === "object" ? prev.eventId : {}),
                        ...updatedEvent,
                      },
                    }
                    : prev
                );
                if (updatedEvent.template) {
                  setActiveTemplateId(updatedEvent.template);
                }
              }
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPreview();
    } else {
      const fetchGuest = async () => {
        try {
          const res = await axios.get(`/api/guests/guest/${guestId}`);
          if (!isMounted) return;
          const guestData = res.data;
          setGuest(guestData);
          setChecked(Boolean(guestData.checkedIn));

          const ev = guestData.eventId;
          if (ev) {
            const templateChoice =
              typeof ev === "object"
                ? ev.template || detectSuggestedTemplate(ev.title, ev.description)
                : "classic-gold";
            setActiveTemplateId(templateChoice);

            const rawEventId = ev._id || ev;
            socketInstance = io(getSocketUrl());
            socketInstance.emit("joinEvent", rawEventId.toString());

            socketInstance.on("eventUpdated", (updatedEvent) => {
              if (!updatedEvent) return;
              setGuest((prev) =>
                prev
                  ? {
                    ...prev,
                    eventId: {
                      ...(typeof prev.eventId === "object" ? prev.eventId : {}),
                      ...updatedEvent,
                    },
                  }
                  : prev
              );
              if (updatedEvent.template) {
                setActiveTemplateId(updatedEvent.template);
              }
            });

            socketInstance.on("guestCheckedIn", (payload) => {
              const incomingId = payload?.guestId;
              const incomingShortCode = payload?.shortCode;
              const currentDbId = guestData._id?.toString();
              const currentShortCode = guestData.shortCode;

              const isMatch =
                (incomingId && (incomingId === currentDbId || incomingId === guestId)) ||
                (incomingShortCode &&
                  (incomingShortCode === currentShortCode || incomingShortCode === guestId));

              if (isMatch) {
                setChecked(true);
                setIsConfirmed(true);
                setGuest((prev) => {
                  if (!prev) return prev;
                  const currentEvent =
                    payload?.guest?.eventId && typeof payload.guest.eventId === "object"
                      ? payload.guest.eventId
                      : prev.eventId;

                  return {
                    ...prev,
                    ...(payload?.guest || {}),
                    checkedIn: true,
                    eventId: currentEvent,
                  };
                });
                if (guestId) {
                  localStorage.setItem(`confirmed_${guestId}`, "true");
                }
                toast.success("Bạn đã được check-in thành công!", { icon: "🎉" });
              }
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchGuest();
    }

    return () => {
      isMounted = false;
      if (socketInstance) socketInstance.disconnect();
    };
  }, [guestId, eventId, isPreview]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (guestId) {
      localStorage.setItem(`confirmed_${guestId}`, "true");
    }
    toast.success("Xác nhận tham dự thành công!");
  };

  const handleSaveTemplateForEvent = async () => {
    const targetEventId = eventId || guest?.eventId?._id;
    if (!targetEventId) return;

    setIsSavingTemplate(true);
    try {
      await axios.put(`/api/events/${targetEventId}`, {
        template: activeTemplateId,
      });
      toast.success(`Đã lưu mẫu "${currentTheme.name}" cho sự kiện!`, {
        icon: "💾",
      });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu mẫu thiệp: " + err.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  if (!guest) {
    return (
      <OuterWrapper $theme={getTemplateById("classic-gold")}>
        <div style={{ color: "#c59346", fontWeight: "bold" }}>Đang tải thiệp mời…</div>
      </OuterWrapper>
    );
  }

  const currentTheme = getTemplateById(activeTemplateId || "classic-gold");

  const eventDateObj = guest.eventId?.date ? new Date(guest.eventId.date) : new Date();
  const timeString = !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "08:00";
  const dd = String(eventDateObj.getDate()).padStart(2, "0");
  const mm = String(eventDateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = eventDateObj.getFullYear();

  const luckyNumber = (
    guest.guestIndex ||
    guest._id?.substring(guest._id.length - 2) ||
    "08"
  ).toUpperCase();

  const eventTitle = guest.eventId?.title || "SỰ KIỆN ĐẶC BIỆT";
  const eventDesc =
    guest.eventId?.description ||
    "Hân hạnh kính mời Quý khách đến tham dự và chung vui cùng chúng tôi.";
  const eventLocation = guest.eventId?.location || "85B, Nguyễn Văn Tư, P. Bến Tre, Vĩnh Long";

  // Check if center emblem is a photo that should be circle-framed
  const isCircleEmblem =
    currentTheme.id !== "classic-gold" && currentTheme.emblemImage;

  return (
    <OuterWrapper $theme={currentTheme}>
      <Page $theme={currentTheme}>
        {/* Top Header / Logos */}
        {currentTheme.hasTopLogos ? (
          <Logos>
            <img src="/invitation_card/logo_1.png" alt="Logo 1" className="logo1" />
            <img src="/invitation_card/logo_2.png" alt="Logo 2" className="logo2" />
            <img src="/invitation_card/logo_3.png" alt="Logo 3" className="logo3" />
          </Logos>
        ) : (
          <TopBadge $theme={currentTheme}>
            {/* <span>{currentTheme.icon}</span> */}
            <span>{currentTheme.badge}</span>
          </TopBadge>
        )}

        <ContentWrapper>
          {/* STATE 1: Chưa xác nhận tham dự */}
          {!isConfirmed && !checked && (
            <>
              <ThuMoi $theme={currentTheme}>Thư Mời</ThuMoi>
              <Subtitle $theme={currentTheme}>Trân trọng kính mời</Subtitle>
              <GuestName $theme={currentTheme}>{guest.name}</GuestName>

              <Divider $theme={currentTheme}>
                {currentTheme.dividerImage ? (
                  <img src={currentTheme.dividerImage} alt="Divider" />
                ) : (
                  <div className="ornamental-line" />
                )}
              </Divider>

              <EventInfo $theme={currentTheme}>
                <div className="pretext">Đến tham dự</div>
                <div className="title">{eventTitle}</div>
                <div className="desc">{eventDesc}</div>
              </EventInfo>

              <EventTimeLoc $theme={currentTheme}>
                <div className="time">{timeString}</div>
                <div className="divider" />
                <div className="date">
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>

              <LocationText $theme={currentTheme}>
                📍 TẠI: {eventLocation}
              </LocationText>

              {/* Artwork Center Graphic */}
              {currentTheme.emblemImage && (
                <CenterGraphic
                  src={currentTheme.emblemImage}
                  alt="Key Visual"
                  $isRounded={isCircleEmblem}
                />
              )}

              <ConfirmBtn $theme={currentTheme} onClick={handleConfirm}>
                Xác nhận tham dự
              </ConfirmBtn>
            </>
          )}

          {/* STATE 2: Đã xác nhận & Chờ check-in */}
          {isConfirmed && !checked && (
            <>
              {guest.qrDataUrl && (
                <QRContainer $theme={currentTheme}>
                  <img src={guest.qrDataUrl} alt="QR Code Check-in" />
                </QRContainer>
              )}

              <InstructionText $theme={currentTheme}>
                Quý khách vui lòng trình mã QR để check in tại sự kiện và nhận được con số may mắn
              </InstructionText>

              {currentTheme.emblemImage && (
                <CenterGraphic
                  src={currentTheme.emblemImage}
                  alt="Key Visual"
                  $isRounded={isCircleEmblem}
                />
              )}

              <EventTimeLoc $theme={currentTheme}>
                <div className="time">{timeString}</div>
                <div className="divider" />
                <div className="date">
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>

              <LocationText $theme={currentTheme}>
                📍 TẠI: {eventLocation}
              </LocationText>

              {guest.eventId?.date && (
                <CountdownView targetDate={guest.eventId.date} theme={currentTheme} />
              )}
            </>
          )}

          {/* STATE 3: Đã Check-in thành công */}
          {checked && (
            <>
              <ThuMoi $theme={currentTheme}>Thư Mời</ThuMoi>
              <Subtitle $theme={currentTheme}>Trân trọng kính mời</Subtitle>
              <GuestName $theme={currentTheme}>{guest.name}</GuestName>

              <Divider $theme={currentTheme}>
                {currentTheme.dividerImage ? (
                  <img src={currentTheme.dividerImage} alt="Divider" />
                ) : (
                  <div className="ornamental-line" />
                )}
              </Divider>

              {guest.qrDataUrl && (
                <QRContainer
                  $theme={currentTheme}
                  style={{ margin: "0.4rem 0", padding: "2px" }}
                >
                  <img
                    src={guest.qrDataUrl}
                    alt="QR Code"
                    style={{ width: "80px", height: "80px" }}
                  />
                </QRContainer>
              )}

              <LuckyNumber $theme={currentTheme}>
                Mã số của bạn là:
                <div className="num">#{luckyNumber}</div>
              </LuckyNumber>

              {currentTheme.emblemImage && (
                <CenterGraphic
                  src={currentTheme.emblemImage}
                  alt="Key Visual"
                  $isRounded={isCircleEmblem}
                  style={{ maxWidth: "200px" }}
                />
              )}

              <EventTimeLoc $theme={currentTheme} style={{ margin: "0.4rem 0" }}>
                <div className="time" style={{ fontSize: "2.2rem" }}>
                  {timeString}
                </div>
                <div className="divider" style={{ height: "30px" }} />
                <div className="date" style={{ fontSize: "0.95rem" }}>
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>

              <LocationText $theme={currentTheme} style={{ fontSize: "0.72rem" }}>
                📍 TẠI: {eventLocation}
              </LocationText>

              {/* Realtime Event Schedule Drawer */}
              <ScheduleList $theme={currentTheme}>
                <div className="header">Theo dõi lịch trình diễn ra sự kiện</div>
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => setIsScheduleOpen((prev) => !prev)}
                >
                  <span>{isScheduleOpen ? "▲ Đóng lịch trình" : "▼ Xem lịch trình chi tiết"}</span>
                </button>

                <div className={`schedule-items ${isScheduleOpen ? "open" : "closed"}`}>
                  {(guest.eventId?.schedule?.length > 0
                    ? guest.eventId.schedule
                    : DEFAULT_SCHEDULE
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className={`item ${item.isActive ? "active" : ""}`}
                    >
                      <div className="content-box">
                        <span className="time">{item.time}:</span>
                        <span className="label">{item.label}</span>
                        {item.isActive && <span className="live-dot" />}
                      </div>
                    </div>
                  ))}
                </div>
              </ScheduleList>
            </>
          )}
        </ContentWrapper>

        {/* Live Organizer Preview Switcher */}
        {isPreview && (
          <FloatingSwitcher>
            <span className="switcher-label">Đổi mẫu:</span>
            {INVITATION_TEMPLATES.map((tpl) => (
              <SwitcherPill
                key={tpl.id}
                type="button"
                $active={activeTemplateId === tpl.id}
                onClick={() => setActiveTemplateId(tpl.id)}
                title={tpl.tagline}
              >
                {tpl.name}
              </SwitcherPill>
            ))}

            <SaveTemplateBtn
              type="button"
              onClick={handleSaveTemplateForEvent}
              disabled={isSavingTemplate}
            >
              {isSavingTemplate ? "Đang lưu…" : "💾 Lưu"}
            </SaveTemplateBtn>
          </FloatingSwitcher>
        )}
      </Page>
    </OuterWrapper>
  );
}
