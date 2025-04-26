import { configureStore } from "@reduxjs/toolkit";
import cartSlice, { cartMiddleware } from "./features/cart/cartSlice";

//quản lý dữ liệu dùng chung giữa nhiều component một cách rõ ràng, dễ kiểm soát.
//Tạo store với cấu hình sẵn toolkitRedux 
export const store = configureStore({
  reducer: {
    cart: cartSlice,
  },
  // là xử lý trung gian của  dispatch(action) và reducer (cập nhật state) 
  //getDefaultMiddleware() là danh sách middleware mặc định của Redux Toolkit
  //cartMiddleware middleware của mình tạo
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartMiddleware),
});
