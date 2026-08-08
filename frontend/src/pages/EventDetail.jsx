import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import QRScanner from "../components/QRScanner";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";

const PageShell = styled.div`
  position: relative;
  padding: 2rem;
  overflow: hidden;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: auto;
    width: 22rem;
    height: 22rem;
    border-radius: 999px;
    filter: blur(28px);
    opacity: 0.45;
    pointer-events: none;
  }

  &::before {
    top: -8rem;
    right: -6rem;
    background: radial-gradient(
      circle,
      rgba(11, 185, 194, 0.28),
      transparent 70%
    );
  }

  &::after {
    bottom: -10rem;
    left: -7rem;
    background: radial-gradient(
      circle,
      rgba(255, 184, 108, 0.18),
      transparent 70%
    );
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 0 auto;
`;

const Hero = styled.section`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  margin-bottom: 1.25rem;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(11, 185, 194, 0.14);
  color: #8cf1f6;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const TitleRow = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
  justify-content: space-between;
`;

const TitleBlock = styled.div`
  text-align: left;
`;

const EventTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
`;

const EventMeta = styled.p`
  margin-top: 0.6rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.98rem;
`;

const StatsGrid = styled.div`
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  border-radius: 18px;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.84rem;
  margin-bottom: 0.35rem;
`;

const StatValue = styled.div`
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const Panel = styled.section`
  background: rgba(15, 18, 28, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
`;

const MutedText = styled.p`
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.92rem;
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1.3fr 1fr auto;
  gap: 0.75rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.42);
  }

  &:focus {
    border-color: rgba(11, 185, 194, 0.8);
    box-shadow: 0 0 0 3px rgba(11, 185, 194, 0.18);
  }
`;

const Button = styled.button`
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.15rem;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #0ab9c2, #2ec4ff);
  color: #041216;
  box-shadow: 0 12px 28px rgba(11, 185, 194, 0.26);
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const ScannerWrap = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.12);
`;

const GuestGrid = styled.div`
  display: grid;
  gap: 0.85rem;
`;

const GuestCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(11, 185, 194, 0.26);
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const GuestInfo = styled.div`
  text-align: left;
`;

const GuestName = styled.div`
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const GuestEmail = styled.div`
  margin-top: 0.2rem;
  color: rgba(255, 255, 255, 0.68);
`;

const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.7rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${({ $checkedIn }) => ($checkedIn ? "#9ef3b2" : "#ffb0b0")};
  background: ${({ $checkedIn }) =>
    $checkedIn ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)"};
`;

const GuestTools = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.7rem;
`;

const QRImage = styled.img`
  width: 108px;
  height: 108px;
  object-fit: contain;
  padding: 0.55rem;
  border-radius: 18px;
  background: #fff;
`;

const ToolRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const GhostButton = styled(SecondaryButton)`
  padding: 0.6rem 0.85rem;
  font-size: 0.88rem;
`;

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({ name: "", email: "" });
  const [scanning, setScanning] = useState(false);
  const [socket, setSocket] = useState(null);

  const fetchEvent = async () => {
    const res = await axios.get(`/api/events/${id}`);
    setEvent(res.data);
  };

  const fetchGuests = async () => {
    const res = await axios.get(`/api/guests/${id}`);
    setGuests(res.data);
  };

  // Initialise socket & fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const s = io(getSocketUrl(), { auth: { token } });
    s.emit("joinEvent", id);
    s.on("guestCheckedIn", ({ guestId }) => {
      setGuests((prev) =>
        prev.map((g) => (g._id === guestId ? { ...g, checkedIn: true } : g)),
      );
      toast.success("Khách đã check‑in (real‑time)");
    });
    setSocket(s);
    fetchEvent();
    fetchGuests();
    return () => s.disconnect();
  }, [id]);

  const addGuest = async (e) => {
    e.preventDefault();
    const payload = { ...newGuest, eventId: id };
    const res = await axios.post("/api/guests", payload);
    setGuests((prev) => [...prev, res.data.guest]);
    setNewGuest({ name: "", email: "" });
    toast.success("Thêm khách thành công");
  };

  const copyLink = async (guestId) => {
    const link = `${window.location.origin}/guest/${guestId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link đã được sao chép!");
  };

  const handleScan = async (data) => {
    try {
      await axios.post("/api/guests/checkin", { token: data });
      toast.success("Check‑in thành công!");
      fetchGuests();
    } catch (err) {
      toast.error(
        "Check‑in thất bại: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setScanning(false);
    }
  };

  const manualCheckIn = async (guestId) => {
    try {
      await axios.post(`/api/guests/guest/${guestId}/checkin`);
      toast.success("Check‑in thành công!");
      // UI will update via socket; fallback:
      setGuests((prev) =>
        prev.map((g) => (g._id === guestId ? { ...g, checkedIn: true } : g)),
      );
    } catch (err) {
      toast.error(
        "Check‑in lỗi: " + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <PageShell>
      <Content>
        {event && (
          <>
            <Hero>
              <Eyebrow>Admin event dashboard</Eyebrow>
              <TitleRow>
                <TitleBlock>
                  <EventTitle>{event.title}</EventTitle>
                  <EventMeta>{new Date(event.date).toLocaleString()}</EventMeta>
                </TitleBlock>
              </TitleRow>

              <StatsGrid>
                <StatCard>
                  <StatLabel>Tổng khách</StatLabel>
                  <StatValue>{guests.length}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Đã check-in</StatLabel>
                  <StatValue>
                    {guests.filter((g) => g.checkedIn).length}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Chưa check-in</StatLabel>
                  <StatValue>
                    {guests.filter((g) => !g.checkedIn).length}
                  </StatValue>
                </StatCard>
              </StatsGrid>
            </Hero>

            <Panel>
              <SectionHeader>
                <div>
                  <SectionTitle>Thêm khách mời</SectionTitle>
                  <MutedText>
                    Điền tên và email nếu có, hệ thống sẽ tạo link QR tự động.
                  </MutedText>
                </div>
              </SectionHeader>

              <FormGrid onSubmit={addGuest}>
                <Field
                  placeholder="Tên khách"
                  value={newGuest.name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, name: e.target.value })
                  }
                  required
                />
                <Field
                  placeholder="Email (không bắt buộc)"
                  value={newGuest.email}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, email: e.target.value })
                  }
                />
                <PrimaryButton type="submit">Thêm khách</PrimaryButton>
              </FormGrid>

              <ScannerWrap>
                <SectionHeader style={{ marginBottom: "0.75rem" }}>
                  <div>
                    <SectionTitle>Quét QR</SectionTitle>
                  </div>
                  <SecondaryButton
                    type="button"
                    onClick={() => setScanning((s) => !s)}
                  >
                    {scanning ? "Hủy quét" : "Mở quét QR"}
                  </SecondaryButton>
                </SectionHeader>
                {scanning && <QRScanner onScan={handleScan} />}
              </ScannerWrap>
            </Panel>

            <Panel>
              <SectionHeader>
                <div>
                  <SectionTitle>Khách mời</SectionTitle>
                </div>
              </SectionHeader>

              <GuestGrid>
                {guests.map((g) => (
                  <GuestCard key={g._id}>
                    <GuestInfo>
                      <GuestName>{g.name}</GuestName>
                      {g.email && <GuestEmail>{g.email}</GuestEmail>}
                      <StatusPill $checkedIn={g.checkedIn}>
                        <span>{g.checkedIn ? "✓" : "!"}</span>
                        <span>
                          {g.checkedIn ? "Đã check-in" : "Chưa check-in"}
                        </span>
                      </StatusPill>
                    </GuestInfo>

                    <GuestTools>
                      {/* {g.qrDataUrl && <QRImage src={g.qrDataUrl} alt="QR" />} */}
                      <ToolRow>
                        <GhostButton
                          type="button"
                          onClick={() => copyLink(g._id)}
                        >
                          Sao chép link
                        </GhostButton>
                        {!g.checkedIn && (
                          <PrimaryButton
                            type="button"
                            onClick={() => manualCheckIn(g._id)}
                          >
                            Check-in
                          </PrimaryButton>
                        )}
                      </ToolRow>
                    </GuestTools>
                  </GuestCard>
                ))}
              </GuestGrid>
            </Panel>
          </>
        )}
      </Content>
    </PageShell>
  );
}
