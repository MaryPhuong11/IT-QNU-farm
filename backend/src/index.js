const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const prisma = require('./lib/prisma');
require('./config/passport'); // cấu hình Passport Google

// Import routes
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const authGoogleRoutes = require('./routes/authGoogle');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React frontend
  credentials: true               // Cho phép gửi cookie
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (required for Passport)
app.use(session({
  secret: 'your-secret-key', // Đổi thành chuỗi bí mật riêng của bạn
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Để true nếu dùng HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authGoogleRoutes);
app.get('/api/auth/google/callback', (req, res) => {
  // Xử lý callback từ Google ở đây
  res.send('Google authentication callback received');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});