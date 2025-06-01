import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { cartMiddleware } from "./features/cart/cartSlice";
import productReducer from '../features/products/productSlice';
import categoryReducer from '../features/categories/categorySlice';
//quản lý dữ liệu dùng chung giữa nhiều component một cách rõ ràng, dễ kiểm soát.
//Tạo store với cấu hình sẵn toolkitRedux 
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    
    categories: categoryReducer,
  },
  // là xử lý trung gian của  dispatch(action) và reducer (cập nhật state) 
  //getDefaultMiddleware() là danh sách middleware mặc định của Redux Toolkit
  //cartMiddleware middleware của mình tạo
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartMiddleware),
});

export default store;