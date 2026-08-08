import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function GuestCheckIn() {
  const [qrUrl, setQrUrl] = useState('');
  const [token, setToken] = useState('sample-token');

  useEffect(() => {
    // Placeholder: fetch QR SVG from backend (replace token as needed)
    axios
      .get(`/api/qr/${token}.svg`, { responseType: 'text' })
      .then((res) => setQrUrl(`data:image/svg+xml;base64,${btoa(res.data)}`))
      .catch(() => setQrUrl(''));
  }, [token]);

  const handleCheckIn = () => {
    axios
      .post(`/api/checkin/${token}`)
      .then(() => alert('Check‑in successful'))
      .catch(() => alert('Check‑in failed'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Guest Check‑In</h1>
      {qrUrl ? <img src={qrUrl} alt="QR code" style={{ width: '200px' }} /> : <p>Loading QR…</p>}
      <br />
      <button onClick={handleCheckIn}>Check In</button>
    </div>
  );
}
