import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";

const float1 = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { 
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.2));
  }
  50% { 
    transform: scale(1.03);
    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.8));
  }
  100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.2));
  }
`;

const OuterWrapper = styled.div`
  min-height: 100svh;
  display: flex;
  justify-content: center;
  background: radial-gradient(circle, #3b2c1c 0%, #120d07 100%);
`;

const Page = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: calc(100svh - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  overflow-x: hidden;
  background-color: #f7e6c3;
  background-image: url("/invitation_card/main_bg.png");
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  color: #725227;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
`;

const Logos = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin-top: 0.5rem;
  padding: 0 5px;

  img.logo1 { height: 45px; }
  img.logo2 { height: 32px; }
  img.logo3 { height: 40px; }
`;

const slideUp = keyframes`
  to { opacity: 1; transform: translateY(0); }
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
  animation: ${slideUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  padding-bottom: 3rem;
`;

const ThuMoi = styled.div`
  font-family: 'Times New Roman', serif;
  font-size: 4rem;
  font-weight: 700;
  color: #fffaea;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  -webkit-text-stroke: 1px #a87932;
  text-shadow: 
     -1px 1px 0 #8f611f,
     -2px 2px 0 #7d5115,
     -3px 3px 0 #66400c,
     -4px 4px 0 #523105,
     -5px 5px 10px rgba(0,0,0,0.5);
`;

const Subtitle = styled.div`
  font-size: 1.1rem;
  font-weight: 400;
  color: #7e4016;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const GuestName = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: ##5b3902;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
`;

const EventInfo = styled.div`
  color: #725227;
  font-size: 0.95rem;
  margin: 0.5rem 0;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.5;

  .title {
    font-size: 1.8rem;
    font-weight: 900;
    color: #fff;
    -webkit-text-stroke: 1px #c59346;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
    margin-bottom: 0.2rem;
    letter-spacing: 0.05em;
  }
`;

const BallImage = styled.img`
  width: 100%;
  max-width: 250px;
  object-fit: contain;
  margin: 0;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  transform-origin: bottom center;
`;

const ConfirmBtn = styled.div`
  width: 260px;
  height: 55px;
  background-image: url('/invitation_card/button.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  margin-top: 1rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e250d;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:active { transform: scale(0.95); }
`;

const QRContainer = styled.div`
  margin: 1.5rem 0 1rem;
  padding: 1px;
  background: #fff;
  border: 5px solid #c59346;
  display: inline-block;
  img {
    width: 140px;
    height: 140px;
    display: block;
  }
`;

const InstructionText = styled.p`
  color: #8f5e01;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0.5rem 0 1rem 0;
  max-width: 280px;
  line-height: 1.4;
`;

const LuckyNumber = styled.div`
  margin: 0.5rem 0;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  
  background: linear-gradient(to top, #8A4B08 30%, #C87D0E 100%, #EFA836 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  
  .num {
    font-size: 3rem;
    font-weight: 900;
    line-height: 1.1;
    background: linear-gradient(to bottom, #8A4B08 30%, #C87D0E 80%, #EFA836 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  }
`;

const EventTimeLoc = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0 0.2rem 0;


  background: linear-gradient(to bottom, #8A4B08 30%, #C87D0E 80%, #EFA836 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  .time {
    font-size: 2.8rem;
    font-weight: 400;
    font-family: 'Times New Roman', serif;
  }
  
  .divider {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, #8A4B08 30%, #C87D0E 80%, #EFA836 100%);
  }

  .date {
    font-size: 1.2rem;
    font-weight: 800;
    text-align: left;
    line-height: 1.1;
    display: flex;
    flex-direction: column;

    span{
      background: linear-gradient(to bottom, #8A4B08 30%, #C87D0E 80%, #EFA836 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`;

const LocationText = styled.p`
  font-size: 0.6rem;
  font-weight: 700;
  margin: 0 0 1rem 0;

  background: linear-gradient(to bottom, #8A4B08 30%, #C87D0E 80%, #EFA836 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
`;

const CountdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  margin-top: 1rem;

  .title {
    font-size: 1.3rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    color: #fff;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
  }
  
  .subtitle {
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 1rem;
    
    background: linear-gradient(to top, #D29837 0%, #F1D487 10%, #FFF3B3 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const TimeBox = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.3rem;

  .value {
    font-size: 3rem;
    font-weight: 800;
    color: #fff;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    line-height: 1;
  }
  .label {
    font-size: 1.2rem;
    font-weight: 400;
    text-transform: capitalize;
    color: #fff;
    margin-right: 0.8rem;
  }
`;

const dotGlow = keyframes`
  0% { box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 15px 5px rgba(255, 255, 255, 1); }
  100% { box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.4); }
`;

const rotateGlow = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg) translateZ(0); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateZ(0); }
`;

const ScheduleList = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  text-align: left;
  padding: 0 10px;
  
  .header {
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  }
  
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 0.6rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #8c5a1a;
    position: relative;
    padding-left: 1.5rem;
    
    &.active {
      color: #fff;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      
      &::before {
        content: '';
        position: absolute;
        left: -3px;
        top: 50%;
        transform: translateY(-50%);
        width: 14px;
        height: 14px;
        background: #fff;
        border-radius: 50%;
        animation: ${dotGlow} 1.5s infinite;
        z-index: 2;
      }
      
      .content-box {
        position: relative;
        overflow: hidden;
        z-index: 1;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
        border: none;
        
        &::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 500px;
          height: 500px;
          background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(255,255,255,0.6) 90%, #fff 100%);
          animation: ${rotateGlow} 2.5s linear infinite;
          z-index: -2;
          will-change: transform;
        }

        &::after {
          content: '';
          position: absolute;
          inset: 2px;
          background: rgba(184, 126, 42, 0.95);
          border-radius: 4px;
          z-index: -1;
        }
      }
    }
    
    .content-box {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 12px;
      border: 1px solid transparent;
      border-radius: 6px;
    }
    
    .time {
      margin-right: 8px;
      font-weight: 800;
      flex-shrink: 0;
    }
    
    .label {
      font-weight: 400;
    }
  }
`;

const SCHEDULE_DATA = [
  { time: "07:00", label: "Tập trung", isActive: true },
  { time: "07:30", label: "Khai mạc" },
  { time: "07:45", label: "Trận đấu 1" },
  { time: "08:30", label: "Trận đấu 2" },
  { time: "09:00", label: "Trận đấu 3" },
  { time: "09:30", label: "Trận đấu 4" },
  { time: "10:00", label: "Trận bán kết 1" },
  { time: "10:30", label: "Trận bán kết 2" },
  { time: "11:00", label: "Trận tranh giải ba" },
  { time: "12:00", label: "Trận chung kết tổng" },
  { time: "12:30", label: "Lễ trao giải" },
  { time: "13:30", label: "Tiệc thân mật" },
  { time: "15:30", label: "Kết thúc chương trình" },
];

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
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60);
    return () => clearTimeout(timer);
  });

  if (Object.keys(timeLeft).length === 0) {
    return <p style={{ color: "#fff", fontWeight: 700, marginTop: "1rem" }}>Sự kiện đang diễn ra!</p>;
  }

  return (
    <CountdownContainer>
      <div className="title">CHỈ CÒN</div>
      <TimeBox style={{ justifyContent: 'center', width: '100%', marginBottom: '5px' }}>
        <span className="value">{timeLeft.days || 0}</span>
        <span className="label">Ngày</span>
      </TimeBox>
      <TimeBox style={{ justifyContent: 'center', width: '100%' }}>
        <span className="value">{timeLeft.hours?.toString().padStart(2, "0") || "00"}</span>
        <span className="label">Giờ</span>
        <span className="value">{timeLeft.minutes?.toString().padStart(2, "0") || "00"}</span>
        <span className="label">Phút</span>
      </TimeBox>
      <div className="subtitle">SỰ KIỆN SẼ DIỄN RA</div>
    </CountdownContainer>
  );
}

export default function GuestView({ isPreview = false }) {
  const { guestId, eventId } = useParams();
  const [guest, setGuest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(() => {
    return localStorage.getItem(`confirmed_${guestId}`) === 'true';
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isPreview) {
      const fetchPreview = async () => {
        try {
          const res = await axios.get(`/api/events/${eventId}`);
          setGuest({
            _id: "02",
            name: "Hữu Toàn",
            eventId: res.data,
            qrDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=preview&color=8c5a1a&bgcolor=ffffff",
          });
        } catch (err) {
          console.error(err);
        }
      };
      fetchPreview();
    } else {
      const fetchGuest = async () => {
        try {
          const res = await axios.get(`/api/guests/guest/${guestId}`);
          setGuest(res.data);
          setChecked(res.data.checkedIn);
          // Assuming we use local state or another field for confirmation later
          if (res.data.eventId) {
            const s = io(getSocketUrl());
            s.emit("joinEvent", res.data.eventId);
            s.on("guestCheckedIn", ({ guestId: updatedId }) => {
              if (updatedId === guestId) {
                setChecked(true);
                toast.success("Bạn đã được check‑in!", {
                  style: {
                    background: "#c59346",
                    color: "#fff",
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
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [guestId, eventId, isPreview]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    localStorage.setItem(`confirmed_${guestId}`, 'true');
    toast.success("Xác nhận tham dự thành công!");
  };

  if (!guest) {
    return (
      <OuterWrapper>
        <Page>
          <ContentWrapper style={{ width: "auto", justifyContent: "center", height: "100svh" }}>
            <p style={{ color: "#c59346", margin: 0, fontWeight: "bold" }}>Đang tải thiệp mời…</p>
          </ContentWrapper>
        </Page>
      </OuterWrapper>
    );
  }

  // Derive simple Date strings
  const eventDateObj = guest.eventId?.date ? new Date(guest.eventId.date) : new Date("2026-08-28T07:00:00");
  const timeString = eventDateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const dd = String(eventDateObj.getDate()).padStart(2, '0');
  const mm = String(eventDateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = eventDateObj.getFullYear();
  // Get index or ID for lucky number
  const luckyNumber = (guest.guestIndex || guest._id?.substring(guest._id.length - 2) || "02").toUpperCase();

  return (
    <OuterWrapper>
      <Page>
        <Logos>
          <img src="/invitation_card/logo_1.png" alt="Logo 1" className="logo1" />
          <img src="/invitation_card/logo_2.png" alt="Logo 2" className="logo2" />
          <img src="/invitation_card/logo_3.png" alt="Logo 3" className="logo3" />
        </Logos>

        <ContentWrapper>
          {/* State 1: Not Confirmed and Not Checked-In */}
          {!isConfirmed && !checked && (
            <>
              <ThuMoi>Thư Mời</ThuMoi>
              <Subtitle>Trân trọng kính mời</Subtitle>
              <GuestName>{guest.name}</GuestName>
              <img src="/invitation_card/divider.png" alt="Divider" style={{ width: '100%', maxWidth: '380px', objectFit: 'contain' }} />

              <EventInfo>
                <div style={{ fontSize: "0.8rem", fontWeight: "400", color: '#7e4016' }}>Đến tham dự</div>
                <div className="title">{guest.eventId?.title || "GIẢI PICKLEBALL"}</div>
                <div style={{ fontSize: "0.8rem", maxWidth: "350px", margin: "0 auto", fontWeight: "900", color: '#7e4016' }}>
                  {guest.eventId?.description || "CHÀO MỪNG KỶ NIỆM 30 NĂM THÀNH LẬP CÔNG TY TNHH TM DV SX TÂN DÂN (1996 - 2026)"}
                </div>
              </EventInfo>

              <EventTimeLoc style={{ marginTop: "1vh" }}>
                <div className="time">{timeString}</div>
                <div className="divider"></div>
                <div className="date">
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>
              <LocationText>TẠI: {guest.eventId?.location || "85B, Nguyễn Văn Tư, P. Bến Tre, Vĩnh Long"}</LocationText>

              <BallImage src="/invitation_card/ball.png" alt="Pickleball" style={{ marginTop: '1vh', maxWidth: '350px' }} />

              <ConfirmBtn onClick={handleConfirm} style={{ marginTop: '4vh' }}>Xác nhận tham dự</ConfirmBtn>
            </>
          )}

          {/* State 2: Confirmed but Not Checked-In */}
          {isConfirmed && !checked && (
            <>
              {guest.qrDataUrl && (
                <QRContainer style={{ marginTop: "10vh" }}>
                  <img src={guest.qrDataUrl} alt="QR Code" />
                </QRContainer>
              )}

              <InstructionText style={{ marginBottom: "2vh" }}>
                Quý khách vui lòng trình mã QR để check in tại sự kiện và nhận được con số may mắn
              </InstructionText>

              <BallImage src="/invitation_card/ball.png" alt="Pickleball" style={{ maxWidth: '350px', marginTop: '4vh' }} />

              <EventTimeLoc style={{ marginTop: "3vh" }}>
                <div className="time">{timeString}</div>
                <div className="divider"></div>
                <div className="date">
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>
              <LocationText>TẠI: {guest.eventId?.location || "85B, Nguyễn Văn Tư, P. Bến Tre, Vĩnh Long"}</LocationText>

              {guest.eventId?.date && (
                <Countdown targetDate={guest.eventId.date} />
              )}
            </>
          )}

          {/* State 3: Checked-In */}
          {checked && (
            <>
              <ThuMoi>Thư Mời</ThuMoi>
              <Subtitle>Trân trọng kính mời</Subtitle>
              <GuestName>{guest.name}</GuestName>
              <img src="/invitation_card/divider.png" alt="Divider" style={{ width: '100%', maxWidth: '380px', objectFit: 'contain' }} />

              {guest.qrDataUrl && (
                <QRContainer style={{ margin: "0.5rem 0", padding: "1px" }}>
                  <img src={guest.qrDataUrl} alt="QR Code" style={{ width: '80px', height: '80px' }} />
                </QRContainer>
              )}

              <LuckyNumber>
                Mã số của bạn là:<br />
                <div className="num">{luckyNumber}</div>
              </LuckyNumber>

              <BallImage src="/invitation_card/ball.png" alt="Pickleball" style={{ maxWidth: '350px', margin: '1vh 0 0 0' }} />

              <EventTimeLoc style={{ margin: '0.5rem 0' }}>
                <div className="time" style={{ fontSize: '2.2rem' }}>{timeString}</div>
                <div className="divider" style={{ height: '30px' }}></div>
                <div className="date" style={{ fontSize: '0.9rem' }}>
                  <span>{dd}.{mm}</span>
                  <span>{yyyy}</span>
                </div>
              </EventTimeLoc>
              <LocationText style={{ fontSize: '0.65rem' }}>TẠI: {guest.eventId?.location || "85B, Nguyễn Văn Tư, P. Bến Tre, Vĩnh Long"}</LocationText>

              <ScheduleList>
                <div className="header">Theo dõi lịch trình diễn ra sự kiện</div>
                {SCHEDULE_DATA.map((item, idx) => (
                  <div key={idx} className={`item ${item.isActive ? 'active' : ''}`}>
                    <div className="content-box">
                      <div className="time">{item.time}:</div>
                      <div className="label">{item.label}</div>
                    </div>
                  </div>
                ))}
              </ScheduleList>
            </>
          )}

        </ContentWrapper>
      </Page>
    </OuterWrapper>
  );
}
