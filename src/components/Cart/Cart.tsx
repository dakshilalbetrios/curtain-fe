import React from 'react';
import { Card, Typography, Button, InputNumber, Space, message, Empty, Divider, Row, Col } from 'antd';
import { Trash2, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services';
import { MainLayout } from '../Layout/MainLayout';

const { Title, Text } = Typography;

export const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      message.error('Your cart is empty');
      return;
    }

    try {
      message.loading('Placing order...', 0);
      
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          collection_sr_no_id: item.collection_sr_no_id,
          quantity: item.quantity
        }))
      };

      await orderService.createOrder(orderData);
      clearCart();
      message.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      message.error('Failed to place order');
    }
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    // Mock pricing - in real app this would come from API
    return cartItems.reduce((total, item) => {
      const mockPrice = item.collection_name.includes('Premium') ? 100 : 50;
      return total + (mockPrice * item.quantity);
    }, 0);
  };

  const shipping = 10;
  const taxes = Math.round(getSubtotal() * 0.02); // 2% tax
  const total = getSubtotal() + shipping + taxes;
  if (cartItems.length === 0) {
    return (
      <MainLayout title="Cart" showBack={true} showCart={false}>
        <Card className="bg-gray-800 border-gray-700">
          <Empty
            image={<ShoppingCart className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <Text className="text-gray-400">Your cart is empty</Text>
            }
          >
            <Button
              type="primary"
              onClick={() => navigate('/collections')}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Browse Collections
            </Button>
          </Empty>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Cart" showBack={true} showCart={false}>
      <div className="space-y-4">
        {/* Items Header */}
        <Title level={4} className="!text-white !mb-4">
          Items
        </Title>
        
        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <Card key={item.collection_sr_no_id} className="bg-gray-800 border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Item Image Placeholder */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-white" />
                </div>
                
                {/* Item Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <Title level={5} className="!text-white !mb-1">
                      {item.collection_name}
                    </Title>
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeFromCart(item.collection_sr_no_id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    />
                  </div>
                  
                  <Text className="text-gray-400 text-sm">
                    Quantity: {item.quantity}
                  </Text>
                  
                  <div className="flex items-center justify-between">
                    <Text className="text-white font-medium">
                      ${item.collection_name.includes('Premium') ? 100 : 50}.00
                    </Text>
                    <Space.Compact size="small">
                      <Button
                        icon={<Minus className="w-3 h-3" />}
                        onClick={() => updateQuantity(item.collection_sr_no_id, item.quantity - 0.5)}
                        disabled={item.quantity <= 0.5}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-8 h-8"
                      />
                      <InputNumber
                        min={0.5}
                        max={item.available_stock}
                        step={0.5}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.collection_sr_no_id, value || 0)}
                        className="w-16 text-center bg-gray-700 border-gray-600"
                        controls={false}
                        size="small"
                      />
                      <Button
                        icon={<Plus className="w-3 h-3" />}
                        onClick={() => updateQuantity(item.collection_sr_no_id, item.quantity + 0.5)}
                        disabled={item.quantity >= item.available_stock}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-8 h-8"
                      />
                    </Space.Compact>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Title level={4} className="!text-white !mb-4 !mt-8">
          Summary
        </Title>
        
        <Card className="bg-gray-800 border-gray-700">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text className="text-gray-300">Subtotal</Text>
              <Text className="text-white">${getSubtotal()}.00</Text>
            </div>
            
            <div className="flex justify-between">
              <Text className="text-gray-300">Shipping</Text>
              <Text className="text-white">${shipping}.00</Text>
            </div>
            
            <div className="flex justify-between">
              <Text className="text-gray-300">Taxes</Text>
              <Text className="text-white">${taxes}.00</Text>
            </div>
            
            <Divider className="border-gray-600 my-4" />
            
            <div className="flex justify-between items-center">
              <Text className="text-white text-lg font-bold">Total</Text>
              <Text className="text-white text-lg font-bold">
                ${total}.00
              </Text>
            </div>

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
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};