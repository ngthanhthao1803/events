import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";

const Page = styled.div`
  position: relative;
  min-height: calc(100svh - 1px);
  display: grid;
  place-items: center;
  padding: 2rem 1rem 3rem;
  overflow: hidden;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: auto;
    width: 26rem;
    height: 26rem;
    border-radius: 999px;
    filter: blur(34px);
    opacity: 0.45;
    pointer-events: none;
  }

  &::before {
    top: -8rem;
    right: -7rem;
    background: radial-gradient(
      circle,
      rgba(255, 198, 111, 0.28),
      transparent 68%
    );
  }

  &::after {
    bottom: -10rem;
    left: -6rem;
    background: radial-gradient(
      circle,
      rgba(112, 214, 255, 0.2),
      transparent 68%
    );
  }
`;

const Invite = styled.div`
  position: relative;
  z-index: 1;
  width: min(100%, 620px);
  padding: 1.25rem;
  border-radius: 30px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.11),
      rgba(255, 255, 255, 0.05)
    ),
    linear-gradient(135deg, rgba(255, 243, 226, 0.12), rgba(11, 185, 194, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  text-align: center;
`;

const Inner = styled.div`
  border-radius: 24px;
  padding: 2rem 1.5rem 1.75rem;
  background: rgba(12, 14, 20, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Ribbon = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 1rem 0 0.35rem;
  font-size: clamp(1.8rem, 4.6vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: #fff;
`;

const SubTitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
`;

const GuestName = styled.div`
  margin-top: 1rem;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.9);
`;

const QRFrame = styled.div`
  width: fit-content;
  margin: 1.4rem auto 1rem;
  padding: 0.9rem;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  color: ${({ $checked }) => ($checked ? "#9ef3b2" : "#ffd0d0")};
  background: ${({ $checked }) =>
    $checked ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)"};
  border: 1px solid
    ${({ $checked }) =>
      $checked ? "rgba(34, 197, 94, 0.22)" : "rgba(239, 68, 68, 0.22)"};
`;

const FooterNote = styled.p`
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.92rem;
`;

export default function GuestView() {
  const { guestId } = useParams();
  const [guest, setGuest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [socket, setSocket] = useState(null);

  // Fetch guest data and establish socket connection
  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const res = await axios.get(`/api/guests/guest/${guestId}`);
        setGuest(res.data);
        setChecked(res.data.checkedIn);
        // Once we have the eventId, join the socket room
        if (res.data.eventId) {
          const s = io(getSocketUrl());
          s.emit("joinEvent", res.data.eventId);
          s.on("guestCheckedIn", ({ guestId: updatedId }) => {
            if (updatedId === guestId) {
              setChecked(true);
              toast.success("Bạn đã được check‑in!");
            }
          });
          setSocket(s);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGuest();
    // Cleanup socket on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [guestId]);

  if (!guest) {
    return (
      <Page>
        <Invite>
          <Inner>
            <p>Đang tải thiệp mời…</p>
          </Inner>
        </Invite>
      </Page>
    );
  }

  return (
    <Page>
      <Invite>
        <Inner>
          <Ribbon>Invitation</Ribbon>
          <Title>{guest.eventId?.title || "Sự kiện"}</Title>
          <SubTitle>Xin chào, {guest.name}.</SubTitle>
          <GuestName>Rất hân hạnh được đón tiếp bạn.</GuestName>

          {guest.qrDataUrl && (
            <QRFrame>
              <img
                src={guest.qrDataUrl}
                alt="QR"
                style={{ width: "210px", display: "block" }}
              />
            </QRFrame>
          )}

          <Status $checked={checked}>
            <span>{checked ? "✓" : "•"}</span>
            <span>{checked ? "Đã điểm danh" : "Chưa điểm danh"}</span>
          </Status>

          <FooterNote>
            Vui lòng xuất trình mã QR này khi đến sự kiện.
          </FooterNote>
        </Inner>
      </Invite>
    </Page>
  );
}
