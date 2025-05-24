const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();
const { createPaymentUrl, processPaymentResponse } = require('./vnpay-service');

const config = {
    VnPay: {
        Version: '2.1.0',
        Command: 'pay',
        TmnCode: 'OZJC5X8T',
        HashSecret:'9WCQITQ936WNK7Z3HQ6XRSJA3HZX362F',
        CurrCode: 'VND',
        Locale: 'vn',
        ReturnUrl: 'http://localhost:3000/vnpay-return',
        BaseUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        TimeZoneId: 'SE Asia Standard Time'
    }
};

// Create VNPay payment
router.post('/vnpay', async (req, res) => {
    const { orderId, amount } = req.body;

    try {
        // Kiểm tra đơn hàng tồn tại
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại'
            });
        }

        function toVNDateTimeString(date) {
            const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000); // +7 giờ
            return vnTime.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        }

        const model = {
            amount: (amount || order.totalAmount) * 100, // Chuyển thành VND xu
            createdDate: toVNDateTimeString(new Date()),
            orderCode: order.id
        };

        // Tạo URL thanh toán
        const url = createPaymentUrl(req, model, config);

        // Cập nhật đơn hàng
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'pending'
            }
        });

        res.json({
            success: true,
            paymentUrl: url,
            orderId: order.id,
            amount: model.amount
        });
    } catch (error) {
        console.error('Error creating VNPay payment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thanh toán VNPay: ' + error.message
        });
    }
});

router.get('/vnpay-return', async (req, res) => {
    const result = processPaymentResponse(req.query, config);

    if (result.success) {
        try {
            // Cập nhật trạng thái đơn hàng
            await prisma.order.update({
                where: { id: result.orderCode },
                data: {
                    paymentStatus: 'completed',
                    status: 'processing',
                    transactionId: result.transactionId,
                    paymentMethod: 'vnpay',
                    paymentDate: new Date()
                }
            });

            // Redirect về trang cảm ơn
            res.redirect(`/thank-you?orderId=${result.orderCode}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: 'Thanh toán thành công nhưng có lỗi khi cập nhật đơn hàng'
            });
        }
    } else {
        // Xử lý khi thanh toán thất bại
        res.redirect(`/payment-failed?orderId=${result.orderCode}`);
    }
});

// Get user addresses
router.get('/addresses/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách địa chỉ' });
    }
});

// Apply voucher
router.post('/voucher/apply', async (req, res) => {
    try {
        const { code, totalAmount } = req.body;

        const voucher = await prisma.voucher.findUnique({
            where: { code }
        });

        if (!voucher) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá không tồn tại'
            });
        }

        if (!voucher.isActive) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá đã bị vô hiệu hóa'
            });
        }

        if (voucher.expirationDate < new Date()) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá đã hết hạn'
            });
        }

        if (voucher.minAmount && totalAmount < voucher.minAmount) {
            return res.json({
                valid: false,
                message: `Đơn hàng tối thiểu ${voucher.minAmount.toLocaleString('vi-VN')}đ`
            });
        }

        const discountAmount = voucher.discountType === 'percentage'
            ? (totalAmount * voucher.value) / 100
            : voucher.value;

        res.json({
            valid: true,
            discountAmount,
            voucher
        });
    } catch (error) {
        console.error('Error applying voucher:', error);
        res.status(500).json({ message: 'Lỗi khi áp dụng mã giảm giá' });
    }
});

// Create order
router.post('/order', async (req, res) => {
    const { userId, addressId, items, voucherCode, paymentMethod } = req.body;

    try {
        // Validate input
        if (!userId || !addressId || !items || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin đơn hàng'
            });
        }

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Calculate total amount
            const totalAmount = items.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );

            // Apply voucher if exists
            let discountAmount = 0;
            let voucher = null;
            if (voucherCode) {
                voucher = await prisma.voucher.findUnique({
                    where: { code: voucherCode }
                });

                if (voucher) {
                    discountAmount = voucher.discountType === 'percentage'
                        ? (totalAmount * voucher.value) / 100
                        : voucher.value;
                }
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    userId,
                    addressId,
                    status: paymentMethod === 'vnpay' ? 'pending' : 'processing',
                    totalAmount: totalAmount - discountAmount,
                    paymentMethod,
                    items: {
                        create: items.map((item) => ({
                            product: { connect: { id: item.productId } },
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            return { order };
        });

        res.json({
            success: true,
            orderId: result.order.id,
            message: 'Tạo đơn hàng thành công'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng: ' + error.message
        });
    }
});

router.get('/test-connection', (req, res) => {
    console.log('Test route hit!');
    res.json({ success: true });
});

module.exports = router;