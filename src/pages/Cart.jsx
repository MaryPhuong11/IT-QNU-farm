import { useEffect } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
} from "../app/features/cart/cartSlice";

const Cart = () => {
  const { cartList } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalPrice = cartList.reduce(
    (price, item) => price + item.qty * item.price,
    0
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    if (cartList.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }
    navigate("/payment");
  };

  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {cartList.length === 0 && (
              <h1 className="no-items product">No Items are add in Cart</h1>
            )}
            {cartList.map((item) => {
              const productQty = item.price * item.qty;
              return (
                <div className="cart-list" key={item.id}>
                  <Row>
                    <Col className="image-holder" sm={4} md={3}>
                      <img src={item.imgUrl} alt="" />
                    </Col>
                    <Col sm={8} md={9}>
                      <Row className="cart-content justify-content-center">
                        <Col xs={12} sm={9} className="cart-details">
                        <h3 className="mb-3">Tên sản phẩm: {item.productName}</h3>

                        <div className="d-flex mb-2" style={{ gap: "40px" }}>
                          <h5 className="mb-0">
                            <strong>Giá:</strong> {item.price}.00 VNĐ
                          </h5>
                          <h5 className="mb-0">
                            <strong>Số lượng:</strong> {item.qty}
                          </h5>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            Tổng: {productQty}.00 VNĐ
                          </h5>
                          
                        </div>
                      </Col>
                        <Col xs={12} sm={3} className="cartControl">
                          <button
                            className="incCart"
                            onClick={() =>
                              dispatch(addToCart({ product: item, num: 1 }))
                            }
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button
                            className="desCart"
                            onClick={() => dispatch(decreaseQty(item))}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </Col>
                      </Row>
                    </Col>
                    <button
                      className="delete"
                      onClick={() => dispatch(deleteProduct(item))}
                    >
                      <ion-icon name="close"></ion-icon>
                    </button>
                  </Row>
                </div>
              );
            })}
          </Col>
          <Col md={4}>
            <div className="cart-total">
              <h2>Tổng giá:</h2>
              <div className="d_flex">
                
                <h3>{totalPrice}.00 VNĐ</h3>
              </div>
              <Button 
                variant="primary" 
                className="w-100 mt-3"
                onClick={handleCheckout}
                disabled={cartList.length === 0}
              >
                Mua hàng
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
