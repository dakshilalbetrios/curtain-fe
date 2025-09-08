import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  InputNumber,
  message,
  Empty,
  Divider,
} from "antd";
import { Trash2, ShoppingCart, Minus, Plus, Package } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import { NewOrderModal } from "../Orders/NewOrderModal";

const { Title, Text } = Typography;

export const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalQuantity,
  } = useCart();
  const navigate = useNavigate();
  const [isNewOrderModalVisible, setIsNewOrderModalVisible] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      message.error("Your cart is empty");
      return;
    }

    const hideLoading = message.loading("Placing order...", 0);

    try {
      // Prepare order data
      const orderData = {
        order_items: cartItems.map((item) => ({
          collection_sr_no_id: item.collection_sr_no_id,
          quantity: item.quantity,
        })),
      };

      await orderService.createOrder(orderData);
      hideLoading();
      clearCart();
      message.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      hideLoading();
      message.error("Failed to place order");
    }
  };

  if (cartItems.length === 0) {
    return (
      <MainLayout title="" showBack={true} showCart={false}>
        <Card className="theme-card">
          <Empty
            image={
              <ShoppingCart className="w-16 h-16 theme-text-tertiary mx-auto" />
            }
            description={
              <Text className="theme-text-secondary">Your cart is empty</Text>
            }
          >
            <div className="space-y-2">
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsNewOrderModalVisible(true)}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Add Items to Cart
              </Button>
            </div>
          </Empty>
        </Card>
        <NewOrderModal
          visible={isNewOrderModalVisible}
          onClose={() => setIsNewOrderModalVisible(false)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="" showBack={false} showCart={false}>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Column - Cart Items (60-70% width on large screens) */}
        <div className="flex-1 lg:flex-[2] space-y-4">
          {/* Items Header */}
          <div className="flex items-center justify-between">
            <Title level={4} className="!theme-text-primary !mb-0">
              My Cart ({cartItems.length})
            </Title>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewOrderModalVisible(true)}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Add Items
            </Button>
          </div>

          {/* Cart Items - Scrollable on large screens only */}
          <div className="space-y-4 lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-2">
            {cartItems.map((item) => (
              <Card key={item.collection_sr_no_id} className="theme-card">
                <div className="flex items-center space-x-4">
                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Title level={5} className="!theme-text-primary !mb-1">
                          {item.sr_no}
                        </Title>
                        <div className="flex items-center space-x-2">
                          <Text className="theme-text-secondary text-sm">
                            {item.collection_name}:
                          </Text>
                          <Text className="theme-text-tertiary text-sm">
                            {item.quantity} {item.unit}
                          </Text>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => removeFromCart(item.collection_sr_no_id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        icon={<Minus className="w-4 h-4" />}
                        onClick={() =>
                          updateQuantity(
                            item.collection_sr_no_id,
                            item.quantity - 0.5
                          )
                        }
                        disabled={item.quantity <= 0.5}
                        className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                        style={{ minWidth: "40px", minHeight: "40px" }}
                      />
                      <InputNumber
                        min={0.5}
                        max={item.available_stock}
                        step={0.5}
                        value={item.quantity}
                        onChange={(value) =>
                          updateQuantity(item.collection_sr_no_id, value || 0)
                        }
                        className="w-10 theme-input !align-center !justify-center !border-none"
                        controls={false}
                        size="small"
                        style={{
                          height: "40px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() =>
                          updateQuantity(
                            item.collection_sr_no_id,
                            item.quantity + 0.5
                          )
                        }
                        disabled={item.quantity >= item.available_stock}
                        className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                        style={{ minWidth: "40px", minHeight: "40px" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Order Summary (30-40% width on large screens) */}
        <div className="lg:flex-1 lg:max-w-md pb-[8rem]">
          <div className="lg:sticky lg:top-4">
            <Title level={4} className="!theme-text-primary !mb-4">
              Order Summary
            </Title>

            <Card className="theme-card">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Text className="theme-text-secondary">Total Items</Text>
                  <Text className="theme-text-primary">{cartItems.length}</Text>
                </div>

                <div className="flex justify-between">
                  <Text className="theme-text-secondary">Total Quantity</Text>
                  <Text className="theme-text-primary">
                    {getTotalQuantity()} units
                  </Text>
                </div>

                <Divider className="theme-border-secondary my-4" />

                <div className="space-y-2">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    onClick={handlePlaceOrder}
                    className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
                  >
                    Place Order
                  </Button>
                  <Button
                    size="large"
                    onClick={clearCart}
                    className="w-full theme-button"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      <NewOrderModal
        visible={isNewOrderModalVisible}
        onClose={() => setIsNewOrderModalVisible(false)}
      />
    </MainLayout>
  );
};
