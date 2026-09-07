import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import QRScanner from "../components/QRScanner";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { getSocketUrl } from "../utils/socketUrl";
import { INVITATION_TEMPLATES, getTemplateById } from "../utils/invitationTemplates";

const TemplateSelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const TemplateChoiceCard = styled.div`
  background: ${({ $selected, theme }) =>
    $selected
      ? (theme.isDark ? "rgba(10, 185, 194, 0.18)" : "rgba(10, 185, 194, 0.12)")
      : (theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc")};
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? "#0ab9c2" : (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};
  border-radius: 14px;
  padding: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &:hover {
    border-color: #0ab9c2;
    transform: translateY(-2px);
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon {
    font-size: 1.4rem;
  }

  .check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #0ab9c2;
    color: #041216;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
  }

  .name {
    font-weight: 800;
    font-size: 0.92rem;
    color: ${({ theme }) => theme.text};
  }

  .badge {
    font-size: 0.74rem;
    font-weight: 600;
    color: ${({ theme }) => theme.textMuted};
  }
`;

const PageShell = styled.div`
  position: relative;
  padding: 0.5rem;
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
  background: ${({ theme }) =>
    theme.isDark
      ? "linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))"
      : "#ffffff"};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 24px 60px rgba(0, 0, 0, 0.18)" : "0 4px 20px rgba(0, 0, 0, 0.05)"};
  margin-bottom: 1.25rem;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: ${({ theme }) => (theme.isDark ? "rgba(11, 185, 194, 0.14)" : "rgba(11, 185, 194, 0.1)")};
  color: ${({ theme }) => (theme.isDark ? "#8cf1f6" : "#0891b2")};
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
  color: ${({ theme }) => theme.text};
`;

const EventMeta = styled.p`
  margin-top: 0.6rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.98rem;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  max-width: 600px;
  margin-top: 1rem;
`;

const EditInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: #0ab9c2; }
  &::placeholder { color: ${({ theme }) => theme.inputPlaceholder}; }
`;

const EditTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  &:focus { border-color: #0ab9c2; }
  &::placeholder { color: ${({ theme }) => theme.inputPlaceholder}; }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const StatsGrid = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 12px;
  padding: 0.35rem 0.65rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc")};
  border: 1px solid ${({ theme }) => theme.cardBorder};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.85rem;
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`;

const Panel = styled.section`
  background: ${({ theme }) => (theme.isDark ? "rgba(15, 18, 28, 0.82)" : "#ffffff")};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 18px 40px rgba(0, 0, 0, 0.2)" : "0 4px 20px rgba(0, 0, 0, 0.05)"};
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
  color: ${({ theme }) => theme.text};
`;

const IconButton = styled.button`
  background: rgba(11, 185, 194, 0.15);
  color: #0ab9c2;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(11, 185, 194, 0.3);
    transform: scale(1.05);
  }
`;

const MutedText = styled.p`
  margin: 0.2rem 0 0;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.92rem;
`;

const ReorderButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const ReorderButton = styled.button`
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
  border: 1px solid ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)")};
  color: inherit;
  border-radius: 4px;
  width: 24px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(11, 185, 194, 0.3);
    border-color: #0ab9c2;
    color: #0ab9c2;
  }

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)")};
  cursor: grab;
  padding: 0 4px;
  user-select: none;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    color: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)")};
  }
`;

const ActiveCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  white-space: nowrap;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  background: ${({ $isActive, theme }) =>
    $isActive
      ? "rgba(10, 185, 194, 0.2)"
      : (theme.isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9")};
  color: ${({ $isActive }) => ($isActive ? "#0ab9c2" : "inherit")};
  border: 1px solid ${({ $isActive }) => ($isActive ? "#0ab9c2" : "transparent")};
  transition: all 0.2s ease;
`;

const ScheduleRowItem = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  background: ${(props) =>
    props.$isDragging ? "rgba(11, 185, 194, 0.15)" : "transparent"};
  border: ${(props) =>
    props.$isDragging ? "1px dashed #0ab9c2" : "1px solid transparent"};
  border-radius: 8px;
  padding: 4px;
  transition: background 0.15s ease, border-color 0.15s ease;
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
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.inputPlaceholder};
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
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: inherit;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  box-shadow: ${({ theme }) => (theme.isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)")};

  &:hover {
    background: ${({ theme }) => theme.buttonSecondaryHover};
    border-color: rgba(10, 185, 194, 0.4);
  }
`;

const ScannerWrap = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 20px;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc")};
  border: 1px dashed ${({ theme }) => theme.cardBorder};
`;

const ScannerResult = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "#f0fdfa")};
  border: 1px solid rgba(11, 185, 194, 0.25);
`;

const ScannerResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const ScannerResultTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const ScannerResultMeta = styled.p`
  margin: 0.2rem 0 0;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.92rem;
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
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.06)" : "#f8fafc")};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(11, 185, 194, 0.4);
    background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
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
  color: ${({ theme }) => theme.text};
`;

const GuestEmail = styled.div`
  margin-top: 0.2rem;
  color: ${({ theme }) => theme.textMuted};
`;

const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $checkedIn, theme }) =>
    $checkedIn
      ? theme.isDark
        ? "#9ef3b2"
        : "#16a34a"
      : theme.isDark
        ? "#ffb0b0"
        : "#dc2626"};
  background: ${({ $checkedIn }) =>
    $checkedIn ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)"};
  border: 1px solid
    ${({ $checkedIn }) =>
    $checkedIn ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)"};
`;

const GuestTools = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: flex-end;
  align-items: center;
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
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 8px;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")};
`;

const DangerGhostButton = styled(GhostButton)`
  color: ${({ theme }) => (theme.isDark ? "#ffb0b0" : "#dc2626")};
  border-color: ${({ theme }) => (theme.isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(220, 38, 38, 0.25)")};

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
`;

const DangerButton = styled(SecondaryButton)`
  color: ${({ theme }) => (theme.isDark ? "#ffb0b0" : "#dc2626")};
  border-color: ${({ theme }) => (theme.isDark ? "rgba(239, 68, 68, 0.5)" : "rgba(220, 38, 38, 0.35)")};

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
`;

const DangerIconButton = styled(IconButton)`
  width: 28px;
  height: 28px;
  color: ${({ theme }) => (theme.isDark ? "#ffb0b0" : "#dc2626")};
  background: ${({ theme }) => (theme.isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)")};
  flex-shrink: 0;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #ef4444;
  }
`;

const SmallPrimaryButton = styled(PrimaryButton)`
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 8px;
`;

const AddGuestBox = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${({ theme }) => (theme.isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc")};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cardBorder};
`;

const DEFAULT_SCHEDULE = [
  { time: "07:00", label: "Tập trung", isActive: true },
  { time: "07:30", label: "Khai mạc", isActive: false },
  { time: "07:45", label: "Trận đấu 1", isActive: false },
  { time: "08:30", label: "Trận đấu 2", isActive: false },
  { time: "09:00", label: "Trận đấu 3", isActive: false },
  { time: "09:30", label: "Trận đấu 4", isActive: false },
  { time: "10:00", label: "Trận bán kết 1", isActive: false },
  { time: "10:30", label: "Trận bán kết 2", isActive: false },
  { time: "11:00", label: "Trận tranh giải ba", isActive: false },
  { time: "12:00", label: "Trận chung kết tổng", isActive: false },
  { time: "12:30", label: "Lễ trao giải", isActive: false },
  { time: "13:30", label: "Tiệc thân mật", isActive: false },
  { time: "15:30", label: "Kết thúc chương trình", isActive: false },
];

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({ name: "", email: "" });
  const [scanning, setScanning] = useState(false);
  const [scannedGuest, setScannedGuest] = useState(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [socket, setSocket] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editData, setEditData] = useState({ title: "", date: "", location: "", description: "", schedule: [], template: "classic-gold" });
  const [draggedScheduleIndex, setDraggedScheduleIndex] = useState(null);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editGuestData, setEditGuestData] = useState({ name: "", email: "" });

  const navigate = useNavigate();

  const fetchEvent = async () => {
    const res = await axios.get(`/api/events/${id}`);
    setEvent(res.data);
    const d = new Date(res.data.date);
    const tzoffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d - tzoffset).toISOString().slice(0, 16);
    const scheduleData =
      res.data.schedule && res.data.schedule.length > 0
        ? res.data.schedule
        : DEFAULT_SCHEDULE;
    setEditData({
      title: res.data.title || "",
      date: localISOTime || "",
      location: res.data.location || "",
      description: res.data.description || "",
      schedule: scheduleData,
      template: res.data.template || "classic-gold",
    });
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
    s.on("guestCheckedIn", ({ guestId, shortCode }) => {
      setGuests((prev) =>
        prev.map((g) =>
          g._id === guestId || (shortCode && g.shortCode === shortCode)
            ? { ...g, checkedIn: true }
            : g,
        ),
      );
      toast.success("Khách đã check‑in (real‑time)");
    });

    s.on("eventUpdated", (updatedEvent) => {
      if (updatedEvent?._id === id) {
        setEvent(updatedEvent);
        const d = new Date(updatedEvent.date);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d - tzoffset).toISOString().slice(0, 16);
        setEditData({
          title: updatedEvent.title || "",
          date: localISOTime || "",
          location: updatedEvent.location || "",
          description: updatedEvent.description || "",
          schedule: updatedEvent.schedule || [],
          template: updatedEvent.template || "classic-gold",
        });
      }
    });

    setSocket(s);
    fetchEvent();
    fetchGuests();
    return () => s.disconnect();
  }, [id]);

  const handleSelectTemplate = async (templateId) => {
    try {
      const payload = {
        title: event?.title || editData.title,
        date: event?.date || new Date(),
        location: event?.location || editData.location,
        description: event?.description || editData.description,
        schedule: event?.schedule || editData.schedule || [],
        template: templateId,
      };
      const res = await axios.put(`/api/events/${id}`, payload);
      setEvent(res.data);
      setEditData((prev) => ({ ...prev, template: templateId }));
      const tInfo = getTemplateById(templateId);
      toast.success(`Đã đổi mẫu thiệp sang "${tInfo.name}"!`);
    } catch (err) {
      toast.error("Lỗi cập nhật mẫu thiệp: " + err.message);
    }
  };

  const handleQuickActiveSchedule = async (idx) => {
    try {
      const currentSchedule =
        event?.schedule && event.schedule.length > 0
          ? event.schedule
          : editData.schedule || [];
      const newSchedule = currentSchedule.map((s, i) => ({
        time: s.time,
        label: s.label,
        isActive: i === idx,
      }));

      const payload = {
        title: event?.title || editData.title,
        date: event?.date || new Date(),
        location: event?.location || editData.location,
        description: event?.description || editData.description,
        schedule: newSchedule,
      };

      const res = await axios.put(`/api/events/${id}`, payload);
      setEvent(res.data);
      setEditData((prev) => ({ ...prev, schedule: res.data.schedule || [] }));
      const activeLabel = newSchedule[idx]?.label || "";
      toast.success(`Đã chuyển mốc sáng: "${activeLabel}" (Realtime)`);
    } catch (err) {
      toast.error("Lỗi cập nhật mốc lịch trình: " + err.message);
    }
  };

  const moveScheduleItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= editData.schedule.length) return;
    const newSchedule = [...editData.schedule];
    const [moved] = newSchedule.splice(fromIdx, 1);
    newSchedule.splice(toIdx, 0, moved);
    setEditData({ ...editData, schedule: newSchedule });
  };

  const handleDragStart = (e, index) => {
    setDraggedScheduleIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedScheduleIndex === null || draggedScheduleIndex === targetIndex) return;
    moveScheduleItem(draggedScheduleIndex, targetIndex);
    setDraggedScheduleIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedScheduleIndex(null);
  };

  const handleSortScheduleByTime = () => {
    if (!editData.schedule || editData.schedule.length === 0) return;
    const newSchedule = [...editData.schedule].sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );
    setEditData({ ...editData, schedule: newSchedule });
    toast.success("Đã sắp xếp lịch trình theo giờ");
  };

  const addGuest = async (e) => {
    e.preventDefault();
    const payload = { ...newGuest, eventId: id };
    const res = await axios.post("/api/guests", payload);
    setGuests((prev) => [...prev, res.data.guest]);
    setNewGuest({ name: "", email: "" });
    toast.success("Thêm khách thành công");
  };

  const slugify = (str) => {
    if (!str) return 'su-kien';
    return String(str)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const copyLink = async (guestId) => {
    const guest = guests.find(g => g._id === guestId);
    const identifier = guest?.shortCode || guestId;
    const eventSlug = slugify(event?.title);
    const link = `${window.location.origin}/guest/${identifier}/${eventSlug}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link đã được sao chép!");
  };

  const handleScan = async (data) => {
    const guest = guests.find((item) => item.qrToken === data);

    if (!guest) {
      toast.error("Không tìm thấy khách khớp với QR này.");
      setScanning(false);
      return;
    }

    setScannedGuest(guest);
    setScanning(false);
  };

  const confirmCheckIn = async () => {
    if (!scannedGuest) return;

    try {
      await axios.post(`/api/guests/guest/${scannedGuest._id}/checkin`);
      toast.success("Check‑in thành công!");
      setGuests((prev) =>
        prev.map((g) =>
          g._id === scannedGuest._id ? { ...g, checkedIn: true } : g,
        ),
      );
      setScannedGuest(null);
    } catch (err) {
      toast.error(
        "Check‑in thất bại: " + (err.response?.data?.message || err.message),
      );
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

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/events/${id}`, editData);
      setEvent(res.data);
      setIsEditing(false);
      setIsEditingSchedule(false);
      toast.success("Cập nhật thành công!");
    } catch (err) {
      toast.error("Lỗi cập nhật: " + err.message);
    }
  };

  const handlePreviewCard = () => {
    window.open(`/guest/preview/${id}`, '_blank');
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Xóa thiệt chứ?")) return;
    try {
      await axios.delete(`/api/events/${id}`);
      toast.success("Đã xóa");
      navigate("/admin/events");
    } catch (err) {
      toast.error("Lỗi khi xóa sự kiện: " + err.message);
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuestId(guest._id);
    setEditGuestData({ name: guest.name, email: guest.email });
  };

  const handleSaveGuest = async (guestId) => {
    try {
      const res = await axios.put(`/api/guests/${guestId}`, editGuestData);
      setGuests((prev) => prev.map((g) => (g._id === guestId ? res.data : g)));
      setEditingGuestId(null);
      toast.success("Cập nhật thông tin khách thành công!");
    } catch (err) {
      toast.error("Lỗi cập nhật khách: " + err.message);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm("Xóa thiệt chứ?")) return;
    try {
      await axios.delete(`/api/guests/${guestId}`);
      setGuests((prev) => prev.filter((g) => g._id !== guestId));
      toast.success("Đã xóa khách mời!");
    } catch (err) {
      toast.error("Lỗi khi xóa khách: " + err.message);
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
                <TitleBlock style={{ width: '100%' }}>
                  {isEditing ? (
                    <EditForm onSubmit={handleUpdateEvent}>
                      <EditInput
                        placeholder="Tên sự kiện"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        required
                      />
                      <EditInput
                        type="datetime-local"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        required
                      />
                      <EditInput
                        placeholder="Địa điểm (không bắt buộc)"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      />
                      <EditTextarea
                        placeholder="Mô tả sự kiện (không bắt buộc)"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      />

                      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                          Mẫu thiệp mời:
                        </label>
                        <TemplateSelectorGrid>
                          {INVITATION_TEMPLATES.map((tmpl) => {
                            const isSelected = (editData.template || "classic-gold") === tmpl.id;
                            return (
                              <TemplateChoiceCard
                                key={tmpl.id}
                                type="button"
                                $selected={isSelected}
                                onClick={() => setEditData({ ...editData, template: tmpl.id })}
                              >
                                <div className="top-row">
                                  {isSelected && <span className="check">✓</span>}
                                </div>
                                <div className="name">{tmpl.name}</div>
                                <div className="badge">{tmpl.tagline}</div>
                              </TemplateChoiceCard>
                            );
                          })}
                        </TemplateSelectorGrid>
                      </div>

                      <ActionRow>
                        <PrimaryButton type="submit">Lưu</PrimaryButton>
                        <SecondaryButton type="button" onClick={() => setIsEditing(false)}>
                          Hủy
                        </SecondaryButton>
                        <DangerButton
                          type="button"
                          onClick={handleDeleteEvent}
                        >
                          Xóa
                        </DangerButton>
                      </ActionRow>
                    </EditForm>
                  ) : isEditingSchedule ? (
                    <EditForm onSubmit={handleUpdateEvent}>
                      <div style={{}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0 }}>Lịch trình sự kiện</h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <SecondaryButton
                              type="button"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              title="Sắp xếp danh sách tự động theo thứ tự giờ tăng dần"
                              onClick={handleSortScheduleByTime}
                            >
                              ⏱ Tự động xếp
                            </SecondaryButton>
                            <SecondaryButton
                              type="button"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => setEditData({ ...editData, schedule: [...editData.schedule, { time: "00:00", label: " ", isActive: false }] })}
                            >
                              + Thêm
                            </SecondaryButton>
                          </div>
                        </div>

                        {editData.schedule.map((item, idx) => (
                          <ScheduleRowItem
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            $isDragging={draggedScheduleIndex === idx}
                          >
                            <DragHandle title="Kéo thả để sắp xếp vị trí">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="5" r="1.5" />
                                <circle cx="15" cy="5" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" />
                                <circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="19" r="1.5" />
                                <circle cx="15" cy="19" r="1.5" />
                              </svg>
                            </DragHandle>

                            <ReorderButtonGroup>
                              <ReorderButton
                                type="button"
                                title="Di chuyển lên trên"
                                disabled={idx === 0}
                                onClick={() => moveScheduleItem(idx, idx - 1)}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                              </ReorderButton>
                              <ReorderButton
                                type="button"
                                title="Di chuyển xuống dưới"
                                disabled={idx === editData.schedule.length - 1}
                                onClick={() => moveScheduleItem(idx, idx + 1)}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </ReorderButton>
                            </ReorderButtonGroup>

                            <EditInput
                              type="time"
                              style={{ flex: 1, minWidth: '95px', padding: '0.5rem' }}
                              value={item.time}
                              onChange={(e) => {
                                const newSchedule = [...editData.schedule];
                                newSchedule[idx].time = e.target.value;
                                setEditData({ ...editData, schedule: newSchedule });
                              }}
                            />
                            <EditInput
                              type="text"
                              placeholder="Nội dung hoạt động"
                              style={{ flex: 3, padding: '0.5rem' }}
                              value={item.label}
                              onChange={(e) => {
                                const newSchedule = [...editData.schedule];
                                newSchedule[idx].label = e.target.value;
                                setEditData({ ...editData, schedule: newSchedule });
                              }}
                            />
                            <ActiveCheckboxLabel
                              title="Tích chọn nếu sự kiện này đang diễn ra thực tế lúc này"
                              $isActive={item.isActive}
                            >
                              <input
                                type="checkbox"
                                checked={item.isActive || false}
                                onChange={(e) => {
                                  const newSchedule = editData.schedule.map((s, i) => ({
                                    ...s,
                                    isActive: i === idx ? e.target.checked : false,
                                  }));
                                  setEditData({ ...editData, schedule: newSchedule });
                                }}
                              />
                              <span>Đang diễn ra</span>
                            </ActiveCheckboxLabel>
                            <SecondaryButton
                              type="button"
                              style={{ padding: '0.4rem 0.6rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => {
                                const newSchedule = editData.schedule.filter((_, i) => i !== idx);
                                setEditData({ ...editData, schedule: newSchedule });
                              }}
                            >
                              Xóa
                            </SecondaryButton>
                          </ScheduleRowItem>
                        ))}
                        {editData.schedule.length === 0 && (
                          <MutedText style={{ textAlign: 'center' }}>Chưa có mốc thời gian nào</MutedText>
                        )}
                      </div>
                      <ActionRow>
                        <PrimaryButton type="submit">Lưu</PrimaryButton>
                        <SecondaryButton type="button" onClick={() => setIsEditingSchedule(false)}>
                          Hủy
                        </SecondaryButton>
                      </ActionRow>
                    </EditForm>
                  ) : (
                    <>
                      <EventTitle>{event.title}</EventTitle>
                      <EventMeta>
                        {new Date(event.date).toLocaleString()}
                        {event.location && ` • ${event.location}`}
                        {` • Mẫu thiệp: ${getTemplateById(event.template).icon} ${getTemplateById(event.template).name}`}
                      </EventMeta>
                      <ActionRow style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                        <SecondaryButton type="button" onClick={() => setIsEditing(true)}>
                          Edit sự kiện
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          onClick={() => {
                            if (!editData.schedule || editData.schedule.length === 0) {
                              setEditData((prev) => ({
                                ...prev,
                                schedule:
                                  event?.schedule && event.schedule.length > 0
                                    ? event.schedule
                                    : DEFAULT_SCHEDULE,
                              }));
                            }
                            setIsEditingSchedule(true);
                          }}
                        >
                          Edit lịch trình
                        </SecondaryButton>
                        <GhostButton
                          type="button"
                          onClick={handlePreviewCard}
                          style={{ background: 'rgba(11, 185, 194, 0.1)', color: '#0ab9c2' }}
                        >
                          Xem thiệp mời
                        </GhostButton>
                      </ActionRow>
                    </>
                  )}
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

            {/* <Panel>
              <SectionHeader style={{ marginBottom: "0.5rem" }}>
                <div>
                  <SectionTitle>Mẫu Thiệp Mời</SectionTitle>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.86rem", color: "var(--muted, #94a3b8)" }}>
                    Chọn phong cách hiển thị thiệp mời gửi đến khách. Nhấn vào mẫu để đổi giao diện tức thì hoặc xem thử thực tế.
                  </p>
                </div>
                <GhostButton
                  type="button"
                  onClick={handlePreviewCard}
                  style={{
                    background: "rgba(11, 185, 194, 0.12)",
                    color: "#0ab9c2",
                    fontWeight: 700,
                    border: "1px solid rgba(11, 185, 194, 0.3)"
                  }}
                >
                  👁️ Xem trước thiệp thực tế
                </GhostButton>
              </SectionHeader>

              <TemplateSelectorGrid>
                {INVITATION_TEMPLATES.map((tmpl) => {
                  const isCurrent = (event.template || "classic-gold") === tmpl.id;
                  return (
                    <TemplateChoiceCard
                      key={tmpl.id}
                      $selected={isCurrent}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      title={`Chọn ${tmpl.name}`}
                    >
                      <div className="top-row">
                        <span className="icon">{tmpl.icon}</span>
                        {isCurrent && <span className="check">✓</span>}
                      </div>
                      <div className="name">{tmpl.name}</div>
                      <div className="badge">{tmpl.tagline}</div>
                      <div style={{ fontSize: "0.72rem", opacity: 0.75, marginTop: "0.2rem" }}>
                        {tmpl.suitableFor}
                      </div>
                    </TemplateChoiceCard>
                  );
                })}
              </TemplateSelectorGrid>
            </Panel> */}

            <Panel>
              <SectionHeader style={{ marginBottom: "0.75rem" }}>
                <div>
                  <SectionTitle>Quét QR Check-in</SectionTitle>
                </div>
                <SecondaryButton
                  type="button"
                  onClick={() => setScanning((s) => !s)}
                >
                  {scanning ? "Hủy quét" : "Mở quét QR"}
                </SecondaryButton>
              </SectionHeader>
              {scanning && <QRScanner onScan={handleScan} />}

              {scannedGuest && (
                <ScannerResult>
                  <ScannerResultHeader>
                    <div>
                      <ScannerResultTitle>
                        {scannedGuest.name}
                      </ScannerResultTitle>
                      <ScannerResultMeta>
                        {scannedGuest.email || "Không có email"}
                      </ScannerResultMeta>
                    </div>
                    <StatusPill $checkedIn={scannedGuest.checkedIn}>
                      <span>{scannedGuest.checkedIn ? "✓" : "!"}</span>
                      <span>
                        {scannedGuest.checkedIn
                          ? "Đã điểm danh"
                          : "Chưa điểm danh"}
                      </span>
                    </StatusPill>
                  </ScannerResultHeader>

                  <ToolRow style={{ justifyContent: "flex-start" }}>
                    <PrimaryButton
                      type="button"
                      onClick={confirmCheckIn}
                      disabled={scannedGuest.checkedIn}
                    >
                      Xác nhận check-in
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => setScannedGuest(null)}
                    >
                      Quét khách khác
                    </SecondaryButton>
                  </ToolRow>
                </ScannerResult>
              )}
            </Panel>


            <Panel>
              <SectionHeader>
                <div>
                  <SectionTitle>Danh sách khách mời</SectionTitle>
                </div>
                <IconButton
                  type="button"
                  onClick={() => setShowAddGuest(!showAddGuest)}
                >
                  {showAddGuest ? "−" : "+"}
                </IconButton>
              </SectionHeader>

              {showAddGuest && (
                <AddGuestBox>
                  <SectionHeader style={{ marginBottom: "1rem" }}>
                    <div>
                      <SectionTitle>Thêm khách mới</SectionTitle>
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
                    <PrimaryButton type="submit">Thêm</PrimaryButton>
                  </FormGrid>
                </AddGuestBox>
              )}

              <GuestGrid>
                {guests.map((g) => (
                  <GuestCard key={g._id}>
                    {editingGuestId === g._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                        <Field
                          placeholder="Tên khách"
                          value={editGuestData.name}
                          onChange={(e) => setEditGuestData({ ...editGuestData, name: e.target.value })}
                        />
                        <Field
                          placeholder="Email"
                          value={editGuestData.email}
                          onChange={(e) => setEditGuestData({ ...editGuestData, email: e.target.value })}
                        />
                        <ToolRow style={{ justifyContent: 'flex-start' }}>
                          <PrimaryButton type="button" onClick={() => handleSaveGuest(g._id)}>Lưu</PrimaryButton>
                          <SecondaryButton type="button" onClick={() => setEditingGuestId(null)}>Hủy</SecondaryButton>
                        </ToolRow>
                      </div>
                    ) : (
                      <>
                        <GuestInfo>
                          <GuestName>{g.name}</GuestName>
                          {g.email && <GuestEmail>{g.email}</GuestEmail>}
                        </GuestInfo>

                        <GuestTools>
                          <ToolRow>
                            <GhostButton
                              type="button"
                              onClick={() => copyLink(g._id)}
                              disabled={copiedId === g._id}
                            >
                              {copiedId === g._id ? "Copied ✓" : "Copy link"}
                            </GhostButton>
                            {!g.checkedIn ? (
                              <SmallPrimaryButton
                                type="button"
                                onClick={() => manualCheckIn(g._id)}
                              >
                                Check-in
                              </SmallPrimaryButton>
                            ) : (
                              <StatusPill $checkedIn={true}>
                                <span>✓</span>
                                <span>Đã check-in</span>
                              </StatusPill>
                            )}
                            <GhostButton type="button" onClick={() => handleEditGuest(g)}>Sửa</GhostButton>
                            <DangerGhostButton
                              type="button"
                              onClick={() => handleDeleteGuest(g._id)}
                            >
                              Xóa
                            </DangerGhostButton>
                          </ToolRow>
                        </GuestTools>
                      </>
                    )}
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
