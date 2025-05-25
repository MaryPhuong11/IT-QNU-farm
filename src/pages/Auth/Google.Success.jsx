import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GoogleSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user); // user là JSON.stringify(user) từ backend

      toast.success('Đăng nhập Google thành công!');
      navigate('/');
    } else {
      toast.error('Đăng nhập Google thất bại!');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>Đang xử lý đăng nhập Google...</div>
  );
};

export default GoogleSuccess;
