import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');
  const user = queryParams.get('user');

  if (token) {
    localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(JSON.parse(decodeURIComponent(user))));
    toast.success('Đăng nhập Google thành công!');
    navigate('/');
  }
}, [navigate, window.location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // If remember me is checked, save email
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('Đăng nhập thành công!');
      
      // Redirect to the page user tried to access, or home page
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
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
              <button className="social-btn facebook">
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