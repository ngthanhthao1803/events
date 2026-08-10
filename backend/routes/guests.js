import express from "express";
import Guest from "../models/Guest.js";
import Event from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import { generateQR } from "../utils/qrcode.js";
import { ioInstance } from "../socket.js";

const router = express.Router();

// Create a guest for an event (POST /api/guests)
router.post("/", async (req, res) => {
  const { eventId, name, email } = req.body;
  if (!eventId || !name) {
    return res.status(400).json({ message: "eventId and name are required" });
  }
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const qrToken = uuidv4();
    const guest = new Guest({ eventId, name, email, qrToken });
    await guest.save();
    const qrDataUrl = await generateQR(qrToken);
    res.status(201).json({ guest, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List guests for a specific event (GET /api/guests/:eventId)
router.get("/:eventId", async (req, res) => {
  try {
    const guests = await Guest.find({ eventId: req.params.eventId });
    // Generate QR for each guest
    const guestsWithQR = await Promise.all(
      guests.map(async (g) => {
        const qrDataUrl = await generateQR(g.qrToken);
        return { ...g.toObject(), qrDataUrl };
      }),
    );
    res.json(guestsWithQR);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public endpoint to get guest info (including event) by guest ID (GET /api/guests/guest/:guestId)
router.get("/guest/:guestId", async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.guestId).populate("eventId");
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    const qrDataUrl = await generateQR(guest.qrToken);
    const guestObj = guest.toObject();
    guestObj.qrDataUrl = qrDataUrl;
    res.json(guestObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check‑in endpoint (POST /api/guests/guest/:guestId/checkin)
router.post("/guest/:guestId/checkin", async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.guestId);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    if (guest.checkedIn)
      return res.status(400).json({ message: "Guest already checked in" });

    guest.checkedIn = true;
    await guest.save();

    ioInstance?.to(guest.eventId.toString()).emit("guestCheckedIn", {
      guestId: guest._id.toString(),
    });

    res.json({ message: "Check-in successful", guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a guest (PUT /api/guests/:guestId)
router.put("/:guestId", async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.guestId, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    const qrDataUrl = await generateQR(guest.qrToken);
    res.json({ ...guest.toObject(), qrDataUrl });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a guest (DELETE /api/guests/:guestId)
router.delete("/:guestId", async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.guestId);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json({ message: "Guest deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
