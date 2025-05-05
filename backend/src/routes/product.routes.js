const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ⚙️ Đường dẫn tuyệt đối đến thư mục uploads trong src
const uploadDir = path.join(__dirname, '../uploads');

// 📁 Tạo thư mục uploads nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ⚙️ Cấu hình Multer lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🖼 API upload ảnh
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`; // ✅ path tương đối để frontend nối vào host
  res.json({ imageUrl });
});

// 🟢 Thêm sản phẩm
router.post('/', async (req, res) => {
  const { productName, price, shortDesc, description, categoryId, imgUrl } = req.body;
  try {
    const newProduct = await prisma.product.create({
      data: {
        productName,
        price: parseFloat(price),
        shortDesc,
        description,
        categoryId: parseInt(categoryId),
        imgUrl,
      },
    });
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed' });
  }
});

// 🔍 Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔍 Get product by ID
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✏️ Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { productName, imgUrl, price, shortDesc, description, categoryId } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        productName,
        imgUrl,
        price: parseFloat(price),
        shortDesc,
        description,
        categoryId: parseInt(categoryId),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// ❌ Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

module.exports = router;
