import express from 'express';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import { ioInstance } from '../socket.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    
    // Aggregation for guest statistics per event
    const guestStats = await Guest.aggregate([
      {
        $group: {
          _id: '$eventId',
          total: { $sum: 1 },
          checkedIn: { $sum: { $cond: ['$checkedIn', 1, 0] } }
        }
      }
    ]);

    const statMap = {};
    guestStats.forEach((g) => {
      statMap[g._id.toString()] = {
        total: g.total,
        checkedIn: g.checkedIn,
      };
    });

    const enriched = events.map((e) => ({
      ...e,
      guestCount: statMap[e._id.toString()]?.total || 0,
      checkedInCount: statMap[e._id.toString()]?.checkedIn || 0,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Broadcast realtime event update to room
    ioInstance?.to(event._id.toString()).emit('eventUpdated', event);

    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await Guest.deleteMany({ eventId: req.params.id });
    res.json({ message: 'Event and related guests deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
