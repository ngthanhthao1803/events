import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String },
  createdBy: { type: String },
  schedule: [{
    time: { type: String, required: true },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default model('Event', EventSchema);
