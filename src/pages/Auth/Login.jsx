import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import './Auth.css';
import { saveCartToServer, getCartFromServer } from "../../app/features/cart/cartApi";
import { setCart } from "../../app/features/cart/cartSlice";
import { useDispatch } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberedEmail') || '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));

  // ✅ Xử lý đăng nhập qua Google OAuth
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    const user = queryParams.get('user');

    if (token && user) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(decodedUser));

        // Đồng bộ giỏ hàng sau đăng nhập Google
        syncCartAfterLogin(decodedUser.id);

        toast.success('Đăng nhập Google thành công!');
        navigate('/');
      } catch (err) {
        toast.error('Đăng nhập Google thất bại!');
        navigate('/login');
      }
    }
  }, [navigate]);

  
  const syncCartAfterLogin = async (userId) => {
    // Lấy cart trên server trước
    const serverCart = await getCartFromServer(userId);

    if (!serverCart.cartList || serverCart.cartList.length === 0) {
      // Chỉ sync local cart lên server nếu server cart đang rỗng
      const localCart = JSON.parse(localStorage.getItem("cartList")) || [];
      const cartList = localCart.map(item => ({
        productId: item.id,
        quantity: item.qty || 1
      }));
      if (cartList.length > 0) {
        await saveCartToServer(cartList, userId);
      }
      // Lấy lại cart từ server sau khi sync
      const newServerCart = await getCartFromServer(userId);
      const mappedCart = (newServerCart.cartList || []).map(item => ({
        id: item.product.id,
        productName: item.product.productName,
        imgUrl: item.product.imgUrl,
        price: Number(item.product.price),
        qty: item.quantity,
      }));
      dispatch(setCart(mappedCart));
      localStorage.setItem("cartList", JSON.stringify(mappedCart));
    } else {
      // Nếu server đã có cart, chỉ lấy cart từ server
      const mappedCart = (serverCart.cartList || []).map(item => ({
        id: item.product.id,
        productName: item.product.productName,
        imgUrl: item.product.imgUrl,
        price: Number(item.product.price),
        qty: item.quantity,
      }));
      dispatch(setCart(mappedCart));
      localStorage.setItem("cartList", JSON.stringify(mappedCart));
    }
  };
  

  const mergeCartItems = (local, server) => {
    const map = new Map();
    [...local, ...server].forEach(item => {
      if (map.has(item.productId)) {
        map.get(item.productId).quantity += item.quantity;
      } else {
        map.set(item.productId, { ...item });
      }
    });
    return Array.from(map.values());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      await syncCartAfterLogin(user.id);

      toast.success('Đăng nhập thành công!');
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Đăng nhập</h2>
          <p>Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="input-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Mật khẩu
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu của bạn"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
          <div className="social-login">
            <p>Hoặc đăng nhập với</p>
            <div className="social-buttons">
              <a
                href="http://localhost:5000/api/auth/google"
                className="social-btn google"
              >
                <FaGoogle /> Google
              </a>
              <button className="social-btn facebook" disabled>
                <FaFacebook /> Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
