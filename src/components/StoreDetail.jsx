import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix lỗi icon không hiển thị trong leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StoreDetail = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/stores/${id}`)
      .then(res => {
        setStore(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi load dữ liệu cửa hàng:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!store) return <p>Không tìm thấy cửa hàng</p>;

  return (
    <div className="container mt-4">
      <h2>{store.name}</h2>
      <p><strong>Địa chỉ:</strong> {store.address}, {store.ward}, {store.district}, {store.city}</p>
      <p><strong>Giờ mở cửa:</strong> {store.openTime} - {store.closeTime}</p>
      <p><strong>SĐT:</strong> {store.phone}</p>
      <p><strong>ID :</strong> {store.id}</p>
      <MapContainer
        center={[store.latitude, store.longitude]}
        zoom={16}
        style={{ height: "400px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[store.latitude, store.longitude]}>
          <Popup>{store.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default StoreDetail;
