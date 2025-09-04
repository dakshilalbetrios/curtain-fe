import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Select,
  Space,
  Row,
  Col,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MainLayout } from "../Layout/MainLayout";
import { ordersAPI, Order } from "../../services/api";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      if (!response.error) {
        setOrders(response.data);
      } else {
        console.error("Failed to fetch orders:", response.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <MainLayout title="My Orders">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Orders">
      <div className="space-y-4 w-full">
        {/* Filter */}
        {isWholesaler && (
          <Card className="bg-gray-800 border-gray-700 w-full">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12}>
                <Space>
                  <Text className="text-gray-300">Filter by status:</Text>
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
                </Space>
              </Col>
              <Col xs={24} sm={12} className="text-right">
                <Text className="text-gray-400">
                  {filteredOrders.length} orders found
                </Text>
              </Col>
            </Row>
          </Card>
        )}

        {/* Order History */}
        <div>
          <Title level={4} className="!text-white !mb-4">
            Order History
          </Title>

          <div className="space-y-3 w-full">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                hoverable
                onClick={() => handleOrderClick(order.id)}
                className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-750 w-full"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex-1 min-w-0 pr-4">
                    <Title level={5} className="!text-white !mb-1">
                      Order {formatOrderId(order.id)}
                    </Title>
                    <Text className="text-gray-400">
                      {moment(order.created_at).format("MMM DD, YYYY")}
                    </Text>
                  </div>
                  <Tag
                    color={getStatusColor(order.status)}
                    className="px-3 py-1 rounded-full text-sm font-medium flex-shrink-0"
                  >
                    {order.status.charAt(0) +
                      order.status.slice(1).toLowerCase()}
                  </Tag>
                </div>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 text-center py-8">
              <Title level={4} className="!text-gray-400">
                No orders found
              </Title>
              <Text className="text-gray-500">
                {statusFilter !== "ALL"
                  ? "No orders with this status"
                  : "You haven't placed any orders yet"}
              </Text>
              {user?.role === "CUSTOMER" && (
                <Button
                  type="primary"
                  className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600"
                  onClick={() => navigate("/collections")}
                >
                  Browse Collections
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
