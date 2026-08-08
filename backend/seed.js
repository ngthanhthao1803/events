import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import Guest from "./models/Guest.js";
import { v4 as uuidv4 } from "uuid";
import { generateQR } from "./utils/qrcode.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/events";

const eventSeeds = [
  {
    title: "Hội Nghị Khởi Đầu 2026",
    date: new Date("2026-08-15T08:30:00.000Z"),
    location: "Trung tâm Hội nghị Sông Hồng, Hà Nội",
    description:
      "Buổi gặp mặt khai mạc dành cho đối tác, khách mời và đội ngũ dự án.",
    createdBy: "ban-to-chuc",
    guests: [
      ["Nguyễn An", "nguyen.an@example.com"],
      ["Trần Minh Anh", "minh.anh@example.com"],
      ["Lê Hoàng Nam", "hoang.nam@example.com"],
      ["Phạm Gia Huy", "gia.huy@example.com"],
      ["Võ Thu Trang", "thu.trang@example.com"],
      ["Đỗ Khánh Linh", "khanh.linh@example.com"],
      ["Bùi Nhật Quang", "nhat.quang@example.com"],
      ["Đặng Thanh Tâm", "thanh.tam@example.com"],
      ["Hoàng Gia Bảo", "gia.bao@example.com"],
      ["Phan Mỹ Duyên", "my.duyen@example.com"],
      ["Tạ Tuấn Kiệt", "tuan.kiet@example.com"],
      ["Lý Ngọc Hân", "ngoc.han@example.com"],
      ["Mai Quang Vinh", "quang.vinh@example.com"],
      ["Huỳnh Bảo Châu", "bao.chau@example.com"],
      ["Ngô Đức Long", "duc.long@example.com"],
      ["Nguyễn Phương Thảo", "phuong.thao@example.com"],
      ["Trương Nhật Hạ", "nhat.ha@example.com"],
      ["Phùng Gia Hân", "gia.han@example.com"],
      ["Cao Minh Tuấn", "minh.tuan@example.com"],
      ["Đinh Hồng Ngọc", "hong.ngoc@example.com"],
    ],
  },
  {
    title: "Tiệc Tri Ân Khách Hàng",
    date: new Date("2026-09-02T12:00:00.000Z"),
    location: "Khách sạn Majestic, TP. Hồ Chí Minh",
    description:
      "Không gian ấm cúng để tri ân khách hàng thân thiết và đối tác lâu năm.",
    createdBy: "phong-kinh-doanh",
    guests: [
      ["Nguyễn Thị Mai", "mai.nguyen@example.com"],
      ["Trần Quốc Bảo", "bao.tran@example.com"],
      ["Lê Thùy Dung", "dung.le@example.com"],
      ["Phạm Khắc Việt", "viet.pham@example.com"],
      ["Vũ Thị Thanh Hà", "thanh.ha@example.com"],
      ["Bùi Gia Khánh", "gia.khanh@example.com"],
      ["Đặng Kiều My", "kieu.my@example.com"],
      ["Hoàng Văn Sơn", "son.hoang@example.com"],
      ["Phan Minh Khoa", "minh.khoa@example.com"],
      ["Lương Thảo Nhi", "thao.nhi@example.com"],
      ["Ngô Thanh Bình", "thanh.binh@example.com"],
      ["Dương Nhật Linh", "nhat.linh@example.com"],
      ["Lê Quốc Huy", "quoc.huy@example.com"],
      ["Trần Gia Hân", "gia.han2@example.com"],
      ["Phạm Yến Nhi", "yen.nhi@example.com"],
      ["Võ Đức Minh", "duc.minh@example.com"],
      ["Hồ Bảo Trâm", "bao.tram@example.com"],
      ["Tô Anh Khoa", "anh.khoa@example.com"],
      ["Châu Ngọc Lan", "ngoc.lan@example.com"],
      ["Đoàn Trọng Nghĩa", "trong.nghia@example.com"],
    ],
  },
  {
    title: "Lễ Ra Mắt Sản Phẩm Mới",
    date: new Date("2026-09-18T10:00:00.000Z"),
    location: "The Vista Hall, Đà Nẵng",
    description:
      "Sự kiện ra mắt sản phẩm với truyền thông, khách mời và cộng đồng người dùng.",
    createdBy: "doi-ngoai",
    guests: [
      ["Nguyễn Nhật Vy", "nhat.vy@example.com"],
      ["Trần Minh Đức", "minh.duc@example.com"],
      ["Lê Gia Hưng", "gia.hung@example.com"],
      ["Phạm Ánh Dương", "anh.duong@example.com"],
      ["Vũ Quỳnh Anh", "quynh.anh@example.com"],
      ["Bùi Hữu Phúc", "huu.phuc@example.com"],
      ["Đặng Mai Phương", "mai.phuong@example.com"],
      ["Hoàng Tuấn Anh", "tuan.anh@example.com"],
      ["Phan Thị Bích", "thi.bich@example.com"],
      ["Lương Đức Tài", "duc.tai@example.com"],
      ["Ngô Hải Nam", "hai.nam@example.com"],
      ["Dương Khánh Vy", "khanh.vy@example.com"],
      ["Lê Mạnh Cường", "manh.cuong@example.com"],
      ["Trần Uyên Nhi", "uyen.nhi@example.com"],
      ["Phạm Hồng Sơn", "hong.son@example.com"],
      ["Võ Thu Phương", "thu.phuong@example.com"],
      ["Hồ Nhật Minh", "nhat.minh@example.com"],
      ["Tạ Ngọc Huyền", "ngoc.huyen@example.com"],
      ["Đỗ Gia Linh", "gia.linh@example.com"],
      ["Chu Thanh Tùng", "thanh.tung@example.com"],
    ],
  },
  {
    title: "Đêm Gặp Gỡ Cựu Sinh Viên",
    date: new Date("2026-10-05T11:30:00.000Z"),
    location: "Trường Đại học Khoa học Xã hội và Nhân văn",
    description:
      "Buổi gặp mặt thân mật giữa các thế hệ sinh viên, giảng viên và cựu sinh viên.",
    createdBy: "cong-doan",
    guests: [
      ["Nguyễn Hải Đăng", "hai.dang@example.com"],
      ["Trần Thị Bảo Ngọc", "bao.ngoc@example.com"],
      ["Lê Văn Phúc", "van.phuc@example.com"],
      ["Phạm Thu Hà", "thu.ha@example.com"],
      ["Vũ Đức Anh", "duc.anh@example.com"],
      ["Bùi Minh Châu", "minh.chau@example.com"],
      ["Đặng Quang Duy", "quang.duy@example.com"],
      ["Hoàng Kim Ngân", "kim.ngan@example.com"],
      ["Phan Gia Bảo", "gia.bao2@example.com"],
      ["Lương Thị Diệu", "thi.dieu@example.com"],
      ["Ngô Nhật Quân", "nhat.quan@example.com"],
      ["Dương Thảo Vy", "thao.vy@example.com"],
      ["Lê Thanh Hằng", "thanh.hang@example.com"],
      ["Trần Đức Thiện", "duc.thien@example.com"],
      ["Phạm Bảo Hân", "bao.han@example.com"],
      ["Võ Minh Nhật", "minh.nhat@example.com"],
      ["Hồ Ngọc Thư", "ngoc.thu@example.com"],
      ["Tạ Phúc Lâm", "phuc.lam@example.com"],
      ["Đỗ An Nhiên", "an.nhien@example.com"],
      ["Chu Mạnh Hùng", "manh.hung@example.com"],
    ],
  },
  {
    title: "Workshop Kỹ Năng Số Hóa",
    date: new Date("2026-11-21T13:00:00.000Z"),
    location: "Không gian sáng tạo D-City, Cần Thơ",
    description:
      "Workshop dành cho nhóm vận hành, marketing và các bạn trẻ yêu công nghệ.",
    createdBy: "dao-tao",
    guests: [
      ["Nguyễn Đức Huy", "duc.huy@example.com"],
      ["Trần Phương Anh", "phuong.anh@example.com"],
      ["Lê Khánh Vy", "khanh.vy2@example.com"],
      ["Phạm Hoài Nam", "hoai.nam@example.com"],
      ["Vũ Ngọc Mai", "ngoc.mai@example.com"],
      ["Bùi Thế Sơn", "the.son@example.com"],
      ["Đặng Thanh Hương", "thanh.huong@example.com"],
      ["Hoàng Nhật Hào", "nhat.hao@example.com"],
      ["Phan An Khang", "an.khang@example.com"],
      ["Lương Quỳnh Như", "quynh.nhu@example.com"],
      ["Ngô Việt Khôi", "viet.khoi@example.com"],
      ["Dương Mỹ Linh", "my.linh@example.com"],
      ["Lê Quốc Thái", "quoc.thai@example.com"],
      ["Trần Minh Châu", "minh.chau2@example.com"],
      ["Phạm Gia Nghi", "gia.nghi@example.com"],
      ["Võ Bảo Long", "bao.long@example.com"],
      ["Hồ Thanh Trúc", "thanh.truc@example.com"],
      ["Tạ Anh Đức", "anh.duc@example.com"],
      ["Đỗ Ngọc Yến", "ngoc.yen@example.com"],
      ["Chu Trung Kiên", "trung.kien@example.com"],
    ],
  },
];

const run = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for seeding");

    // Xóa dữ liệu cũ
    await Event.deleteMany({});
    await Guest.deleteMany({});
    console.log("🗑️ Đã xóa dữ liệu cũ");

    let totalGuests = 0;

    for (const seed of eventSeeds) {
      const event = new Event({
        title: seed.title,
        date: seed.date,
        location: seed.location,
        description: seed.description,
        createdBy: seed.createdBy,
      });
      await event.save();
      console.log("📅 Đã tạo event:", event.title);

      for (let index = 0; index < seed.guests.length; index += 1) {
        const [name, email] = seed.guests[index];
        const token = uuidv4();
        await generateQR(token);
        const guest = new Guest({
          eventId: event._id,
          name,
          email,
          qrToken: token,
          checkedIn: index % 4 === 0,
        });
        await guest.save();
        totalGuests += 1;
        console.log(`👤 Tạo guest ${name} – token: ${token}`);
      }
    }

    console.log(
      `✅ Seed data hoàn tất với ${eventSeeds.length} sự kiện và ${totalGuests} khách mời`,
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi seed data:", err);
    process.exit(1);
  }
};

run();
