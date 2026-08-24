import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config();

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

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/events';
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const events = await Event.find();
    for (const event of events) {
      if (!event.schedule || event.schedule.length === 0) {
        event.schedule = DEFAULT_SCHEDULE;
        await event.save();
        console.log(`Updated event: ${event.title}`);
      }
    }
    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrate();
