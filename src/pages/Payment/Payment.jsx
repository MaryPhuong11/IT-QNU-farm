import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

import AddressSelector from '../../components/Payment/AddressSelector';
import VoucherInput from '../../components/Payment/VoucherInput';
import PaymentMethodSelector from '../../components/Payment/PaymentMethodSelector';
import OrderSummary from '../../components/Payment/OrderSummary';

const API_URL = 'http://localhost:5000/api';

const Payment = () => {
  const navigate = useNavigate();
  const { cartList } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [voucher, setVoucher] = useState(null);
  const [shippingFee] = useState(30000);

  // Kiểm tra đăng nhập
  if (!user) {
    navigate('/login', { state: { from: '/payment' } });
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedAddress) {
      toast.warning('Vui lòng chọn địa chỉ nhận hàng');
      return;
    }

    if (cartList.length === 0) {
      toast.warning('Giỏ hàng trống');
      return;
    }

    try {
      setLoading(true);

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        userId: user.id,
        addressId: selectedAddress.id,
        items: cartList.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: parseFloat(item.price +shippingFee)  
        })),
        voucherCode: voucher?.code,
        paymentMethod: selectedMethod
      };

      if (selectedMethod === 'vnpay') {
        // Tạo đơn hàng và lấy URL thanh toán VNPay
        const response = await axios.get(`${API_URL}/payment/create-payment`, orderData);
        window.location.href = response.data.paymentUrl;
      } else {
        // Tạo đơn hàng COD
        const response = await axios.post(`${API_URL}/payments/order`, orderData);
        
        if (response.data.success) {
          toast.success('Đặt hàng thành công');
          navigate('/orders');
        } else {
          throw new Error(response.data.message || 'Có lỗi xảy ra khi đặt hàng');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Thanh toán</h2>
      <Row>
        <Col md={8}>
          <AddressSelector onSelectAddress={setSelectedAddress} />
          <VoucherInput onVoucherApplied={setVoucher} />
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
        </Col>
        <Col md={4}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <OrderSummary voucher={voucher} shippingFee={shippingFee} />
            <Button
              variant="primary"
              size="lg"
              className="w-100 mt-3"
              onClick={handleSubmit}
              disabled={loading || !selectedAddress}
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment; 