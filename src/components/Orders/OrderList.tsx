import React, { useState, useEffect } from "react";
import { Card, Typography, Tag, Select, Space, Row, Col, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { orderService, OrderResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) => statusFilter === "ALL" || order.status === statusFilter
  );

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "APPROVED":
        return "green";
      case "SHIPPED":
        return "blue";
      case "DELIVERED":
        return "purple";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  const formatOrderId = (id: number) => {
    return `#${id.toString().padStart(6, "0")}`;
  };

  // Skeleton loading component
  const OrderSkeleton = () => (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  return (
    <MainLayout title="My Orders">
      <div className="space-y-4">
        {/* Order History */}
        <div>
          <div className="flex sticky top-0 z-10 justify-between items-center">
            <div className="flex items-center space-x-2">
              <Title level={4} className="!text-white">
                Orders
              </Title>
              <Tag color="green">{filteredOrders.length}</Tag>
            </div>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-32"
              size="small"
            >
              <Option value="ALL">All</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="SHIPPED">Shipped</Option>
              <Option value="DELIVERED">Delivered</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <OrderSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 text-center py-12">
                  <Title level={4} className="!text-gray-400 !mb-2">
                    No Orders Found
                  </Title>
                  <Text className="text-gray-500">
                    {statusFilter !== "ALL"
                      ? "No orders with this status"
                      : "No orders available at the moment"}
                  </Text>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    hoverable
                    onClick={() => handleOrderClick(order.id)}
                    className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-750"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <Title level={5} className="!text-white !mb-1">
                          Order {formatOrderId(order.id)}
                        </Title>
                        <Text className="text-gray-400">
                          {moment(order.created_at).format("MMM DD, YYYY")}
                        </Text>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-1">
                            <Text className="text-gray-500 text-sm">
                              {order.order_items.length} item
                              {order.order_items.length > 1 ? "s" : ""}
                            </Text>
                          </div>
                        )}
                      </div>
                      <Tag
                        color={getStatusColor(order.status)}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </Tag>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
