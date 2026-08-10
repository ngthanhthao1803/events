import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";

const float1 = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -50px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
`;

const float2 = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 40px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const Page = styled.div`
  position: relative;
  min-height: calc(100svh - 1px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  overflow: hidden;
  background-color: #0a1128;
  background-image: url("/bg-invitation.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const slideUp = keyframes`
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: min(100%, 420px);
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  animation: ${slideUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const Ribbon = styled.div`
  display: inline-block;
  padding: 0.3rem 1.2rem;
  border-radius: 4px;
  border: 1px solid #d4af37; /* Màu vàng đồng */
  color: #d4af37;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
`;

const EventTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  line-height: 1.2;
  font-weight: 800;
  color: #d4af37; /* Màu vàng đồng */
  text-transform: uppercase;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.02em;
`;

const Greeting = styled.p`
  margin: 0 0 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  font-weight: 400;

  strong {
    color: #fff;
    font-weight: 600;
  }
`;

const QRContainer = styled.div`
  background: #fff;
  padding: 1px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 0.5rem;
  border: 3px solid #d4af37;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  img {
    width: 200px;
    height: 200px;
    display: block;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;

  color: ${({ $checked }) => ($checked ? "#0f0c29" : "#d4af37")};
  background: ${({ $checked }) => ($checked ? "#d4af37" : "transparent")};
  border: 1px solid #d4af37;
`;

const FooterText = styled.p`
  margin: 1.5rem 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

const EventInfo = styled.div`
  color: #fff;
  font-size: 0.95rem;
  p {
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  svg {
    color: #d4af37;
    flex-shrink: 0;
  }
`;

const CountdownContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.1rem 0;
`;

const TimeBox = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(15, 12, 41, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 8px;
  padding: 0.35rem 0.45rem;
  min-width: 44px;
  min-height: 46px;
  align-items: center;
  justify-content: center;

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #d4af37;
    line-height: 1;
  }
  .label {
    font-size: 0.58rem;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    margin-top: 1px;
    line-height: 1;
  }
`;

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  const labels = {
    days: "Ngày",
    hours: "Giờ",
    minutes: "Phút",
    seconds: "Giây",
  };

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <TimeBox key={interval}>
        <span className="value">
          {timeLeft[interval].toString().padStart(2, "0")}
        </span>
        <span className="label">{labels[interval]}</span>
      </TimeBox>,
    );
  });

  if (!timerComponents.length) {
    return (
      <p style={{ color: "#d4af37", fontWeight: 600, margin: "1rem 0" }}>
        Sự kiện đang diễn ra!
      </p>
    );
  }

  return <CountdownContainer>{timerComponents}</CountdownContainer>;
}

export default function GuestView() {
  const { guestId } = useParams();
  const [guest, setGuest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const res = await axios.get(`/api/guests/guest/${guestId}`);
        setGuest(res.data);
        setChecked(res.data.checkedIn);
        if (res.data.eventId) {
          const s = io(getSocketUrl());
          s.emit("joinEvent", res.data.eventId);
          s.on("guestCheckedIn", ({ guestId: updatedId }) => {
            if (updatedId === guestId) {
              setChecked(true);
              toast.success("Bạn đã được check‑in!", {
                style: {
                  background: "#d4af37",
                  color: "#0f0c29",
                },
              });
            }
          });
          setSocket(s);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGuest();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [guestId]);

  if (!guest) {
    return (
      <Page>
        <ContentWrapper style={{ width: "auto" }}>
          <p style={{ color: "#d4af37", margin: 0 }}>Đang tải thiệp mời…</p>
        </ContentWrapper>
      </Page>
    );
  }

  return (
    <Page>
      <ContentWrapper>
        <Ribbon>VIP Invitation</Ribbon>
        <EventTitle>{guest.eventId?.title || "Sự kiện"}</EventTitle>

        {guest.eventId && (
          <>
            <EventInfo>
              <p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {new Date(guest.eventId.date).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {guest.eventId.location}
              </p>
            </EventInfo>
            {guest.eventId.date && (
              <Countdown targetDate={guest.eventId.date} />
            )}
          </>
        )}

        <Greeting>
          Khách mời, <strong>{guest.name}</strong>
        </Greeting>

        {guest.qrDataUrl && (
          <QRContainer>
            <img src={guest.qrDataUrl} alt="QR Code" />
          </QRContainer>
        )}

        <div>
          <StatusBadge $checked={checked}>
            {checked ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Đã điểm danh thành công
              </>
            ) : (
              "Chưa điểm danh"
            )}
          </StatusBadge>
        </div>

        {/* <FooterText>
          Vui lòng xuất trình mã QR này tại quầy lễ tân khi đến sự kiện.
        </FooterText> */}
      </ContentWrapper>
    </Page>
  );
}
