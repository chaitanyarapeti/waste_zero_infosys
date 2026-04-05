const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import all routes
const userRoutes = require('./routes/userRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Mount all API routes
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// WebSocket connection handling
const users = new Map(); // Store connected users: userId -> socketId

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
        users.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} joined with socket ${socket.id}`);
        
        // Broadcast online users
        io.emit('users_online', Array.from(users.keys()));
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
        const { sender_id, receiver_id, content } = data;
        
        try {
            // Save message to database
            const Message = require('./models/Messages');
            const User = require('./models/user');
            const Notification = require('./models/Notifications');
            
            const message = new Message({
                sender_id,
                receiver_id,
                content,
                timestamp: new Date()
            });
            const savedMessage = await message.save();
            
            // Populate sender and receiver info
            await savedMessage.populate('sender_id', 'name email');
            await savedMessage.populate('receiver_id', 'name email');

            // Create notification for the receiver
            const sender = await User.findById(sender_id);
            const latestNotification = await Notification.findOne().sort({ id: -1 });
            const nextId = latestNotification ? latestNotification.id + 1 : 1;
            
            const notification = new Notification({
                id: nextId,
                user_id: receiver_id,
                type: 'messages',
                message: `New message from ${sender?.name || 'Someone'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                sent_at: new Date()
            });
            
            await notification.save();
            console.log(`Message notification sent to user ${receiver_id} from ${sender?.name}`);

            // Send to receiver if online
            const receiverSocketId = users.get(receiver_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', savedMessage);
                // Also send notification update
                io.to(receiverSocketId).emit('new_notification', notification);
            }

            // Send back to sender
            socket.emit('message_sent', savedMessage);
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('message_error', { error: error.message });
        }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        const receiverSocketId = users.get(data.receiver_id);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', {
                sender_id: data.sender_id,
                isTyping: data.isTyping
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            users.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected`);
            io.emit('users_online', Array.from(users.keys()));
        }
    });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`WebSocket server running`);
});
