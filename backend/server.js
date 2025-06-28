const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const blockRoutes = require('./routes/blockroutes');

// 🛠️ استدعاء مسارات التطبيق
const authRoutes = require('./routes/authroutes');
const donationRoutes = require('./routes/donationsroutes');
const messageRoutes = require('./routes/messageroutes');
const userRoutes = require('./routes/usersroutes');
const savedRoutes = require('./routes/savedroutes');
const reportRoutes = require("./routes/reportRoutes");

const conversationRoutes = require('./routes/conversationsroutes');


// ✅ إعداد Express و HTTP Server
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5176',
        'http://localhost:5177',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }
});

// ✅ Middleware


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5176','http://localhost:5177','http://localhost:5174'],
  credentials: true
}));

// ✅ المسارات
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved', savedRoutes);

app.use('/api/block', blockRoutes);
app.use('/api/conversations', conversationRoutes);
// ✅ ملفات الصور
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.use("/api/stats", require("./routes/stats"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", reportRoutes);

// ✅ WebSocket setup
require('./socket')(io);

// ✅ الاتصال بقاعدة البيانات وتشغيل السيرفر
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    require('./socket')(io);
    
    server.listen(process.env.PORT, () => {
      console.log('✅ Connected to DB and server is running on port', process.env.PORT);
    });
  } catch (err) {
    console.error(err);
  }
}
connectDB();
