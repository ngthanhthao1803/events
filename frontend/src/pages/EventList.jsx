import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Card = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const res = await axios.get("/api/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await axios.post("/api/events", { title, date: new Date() });
    setTitle("");
    fetchEvents();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Quản lý Sự kiện</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: "2rem" }}>
        <input
          placeholder="Tên sự kiện"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "300px", padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Tạo</button>
      </form>
      {events.map((ev) => (
        <Card key={ev._id}>
          <div>
            <strong>{ev.title}</strong>
            <br />
            <small>{new Date(ev.date).toLocaleString()}</small>
          </div>
          <Link to={`/admin/events/${ev._id}`}>Quản lý</Link>
        </Card>
      ))}
    </div>
  );
}
