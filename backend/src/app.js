const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 🖼 Cho phép truy cập ảnh trong src/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// APIs
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
