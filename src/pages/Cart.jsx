import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
  setCart,
} from "../app/features/cart/cartSlice";
import { addCartItemAPI, removeCartItemAPI, getCartFromServer } from "../app/features/cart/cartApi";

const Cart = () => {
  const { cartList } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const totalPrice = cartList.reduce(
    (price, item) => price + item.qty * item.price,
    0
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  // Chỉ lưu cartList vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartList));
  }, [cartList]);

  // Khi chưa đăng nhập, lấy cart từ localStorage vào Redux (chỉ chạy 1 lần)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      const storedCart = JSON.parse(localStorage.getItem("cartList")) || [];
      if (cartList.length === 0 && storedCart.length > 0) {
        storedCart.forEach((item) => {
          dispatch(addToCart({ product: item, num: item.qty }));
        });
      }
    }
    // Nếu đã đăng nhập, cart sẽ được lấy từ server ở App.js
    window.scrollTo(0, 0);
  }, []);

  const handleIncrease = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      await addCartItemAPI(user.id, item.id, 1);
      const serverCart = await getCartFromServer(user.id);
      const mappedCart = (serverCart.cartList || []).map((i) => ({
        id: i.product.id,
        productName: i.product.productName,
        imgUrl: i.product.imgUrl,
        price: Number(i.product.price),
        qty: i.quantity,
      }));
      dispatch(setCart(mappedCart));
      localStorage.setItem("cartList", JSON.stringify(mappedCart));
    } else {
      dispatch(addToCart({ product: item, num: 1 }));
    }
  };

  const handleDecrease = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      if (item.qty > 1) {
        await addCartItemAPI(user.id, item.id, -1);
      } else {
        await removeCartItemAPI(user.id, item.id);
      }
      const serverCart = await getCartFromServer(user.id);
      const mappedCart = (serverCart.cartList || []).map((i) => ({
        id: i.product.id,
        productName: i.product.productName,
        imgUrl: i.product.imgUrl,
        price: Number(i.product.price),
        qty: i.quantity,
      }));
      dispatch(setCart(mappedCart));
      localStorage.setItem("cartList", JSON.stringify(mappedCart));
    } else {
      dispatch(decreaseQty(item));
    }
  };

  const handleDelete = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      await removeCartItemAPI(user.id, item.id);
      const serverCart = await getCartFromServer(user.id);
      const mappedCart = (serverCart.cartList || []).map((i) => ({
        id: i.product.id,
        productName: i.product.productName,
        imgUrl: i.product.imgUrl,
        price: Number(i.product.price),
        qty: i.quantity,
      }));
      dispatch(setCart(mappedCart));
      localStorage.setItem("cartList", JSON.stringify(mappedCart));
    } else {
      dispatch(deleteProduct(item));
    }
  };

  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {cartList.length === 0 ? (
              <h1 className="no-items product">No Items are added in Cart</h1>
            ) : (
              cartList.map((item) => {
                const productQty = item.price * item.qty;
                return (
                  <div className="cart-list" key={item.id}>
                    <Row>
                      <Col className="image-holder" sm={4} md={3}>
                        <img src={item.imgUrl} alt={item.productName} />
                      </Col>
                      <Col sm={8} md={9}>
                        <Row className="cart-content justify-content-center">
                          <Col xs={12} sm={9} className="cart-details">
                            <h3>{item.productName}</h3>
                            <h4>
                              {formatCurrency(item.price)} * {item.qty}
                              <span>{formatCurrency(productQty)}</span>
                            </h4>
                          </Col>
                          <Col xs={12} sm={3} className="cartControl">
                            <button
                              className="incCart"
                              onClick={() => handleIncrease(item)}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                            <button
                              className="desCart"
                              onClick={() => handleDecrease(item)}
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12}>
                            <button
                              className="delete"
                              onClick={() => handleDelete(item)}
                            >
                              <ion-icon name="close"></ion-icon>
                            </button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                );
              })
            )}
          </Col>
          <Col md={4}>
            <div className="cart-total">
              <h2>Cart Summary</h2>
              <div className="d_flex">
                <h4>Total Price :</h4>
                <h3>{formatCurrency(totalPrice)}</h3>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
