import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const GuestSchema = new Schema({
  eventId: { type: mongoose.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { type: String },
  shortCode: { type: String, unique: true },
  qrToken: { type: String, required: true, unique: true },
  checkedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model('Guest', GuestSchema);
