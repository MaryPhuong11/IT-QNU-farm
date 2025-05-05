const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get category by ID
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Create category
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Create failed (maybe name is duplicate)' });
  }
});

// ✅ Update category
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// ✅ Delete category
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed (maybe still has products)' });
  }
});

module.exports = router;
