import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(135deg, #0ab9c2, #aa3bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
  line-height: 1.2;
  padding-bottom: 0.1em; /* Ngăn chặn việc cắt xén đuôi chữ ở một số trình duyệt */
`;

const Form = styled.form`
  display: flex;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
`;

const Input = styled.input`
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  color: inherit;
  font-size: 1rem;
  outline: none;
  min-width: 250px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #0ab9c2, #2ec4ff);
  color: #041216;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(11, 185, 194, 0.3);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, border-color 0.3s, background 0.3s;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(11, 185, 194, 0.3);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const EventName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: inherit;
`;

const EventDate = styled.p`
  margin: 0 0 1.5rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const ActionLink = styled(Link)`
  display: inline-block;
  text-align: center;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(11, 185, 194, 0.15);
    color: #0ab9c2;
  }
`;

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await axios.post("/api/events", { title, date: new Date() });
      setTitle("");
      navigate(`/admin/events/${res.data._id}`);
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Events</Title>
        <Form onSubmit={handleCreate}>
          <Input
            placeholder="Nhập tên sự kiện mới..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Button type="submit">Tạo</Button>
        </Form>
      </Header>

      <Grid>
        {events.map((ev) => (
          <Card key={ev._id}>
            <div>
              <EventName>{ev.title}</EventName>
              <EventDate>
                {new Date(ev.date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </EventDate>
            </div>
            <ActionLink to={`/admin/events/${ev._id}`}>
              Quản lý sự kiện ➔
            </ActionLink>
          </Card>
        ))}
      </Grid>
    </PageContainer>
  );
}
