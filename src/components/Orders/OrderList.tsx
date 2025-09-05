import React, { useState, useEffect } from "react";
import { Card, Typography, Tag, Select, Row, Col, Skeleton } from "antd";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { orderService, OrderResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <div className="sticky top-0 z-50 bg-gray-900 backdrop-blur-sm border-b border-gray-700/50 pb-4 pt-4 -mx-4 px-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Title level={4} className="!text-white !mb-0">
                  Orders
                </Title>
                <Tag color="green" className="px-2 py-1 text-sm font-medium">
                  {filteredOrders.length}
                </Tag>
              </div>

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-32"
                size="middle"
                style={{
                  backgroundColor: "#374151",
                  borderColor: "#4B5563",
                  color: "white",
                }}
              >
                <Option value="ALL">All</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="SHIPPED">Shipped</Option>
                <Option value="DELIVERED">Delivered</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </div>
          </div>

          {loading ? (
            <Row gutter={[16, 16]}>
              {[...Array(6)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <OrderSkeleton />
                </Col>
              ))}
            </Row>
          ) : (
            <>
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
                <Row gutter={[16, 16]}>
                  {filteredOrders.map((order) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
                      <Card
                        hoverable
                        onClick={() => handleOrderClick(order.id)}
                        className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-750 hover:border-purple-500 h-full"
                      >
                        <div className="space-y-3">
                          {/* Order Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Title level={5} className="!text-white !mb-1">
                                Order {formatOrderId(order.id)}
                              </Title>
                              <Text className="text-gray-400 text-sm">
                                {moment(order.created_at).format(
                                  "MMM DD, YYYY"
                                )}
                              </Text>
                            </div>
                            <Tag
                              color={getStatusColor(order.status)}
                              className="px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {order.status.charAt(0) +
                                order.status.slice(1).toLowerCase()}
                            </Tag>
                          </div>

                          {/* Order Items Count */}
                          {order.order_items &&
                            order.order_items.length > 0 && (
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-4 h-4 text-gray-400" />
                                  <Text className="text-gray-500 text-sm">
                                    {order.order_items.length} item
                                    {order.order_items.length > 1 ? "s" : ""}
                                  </Text>
                                </div>
                                {moment().diff(
                                  moment(order.created_at),
                                  "days"
                                ) > 4 &&
                                  order.status === "PENDING" && (
                                    <Tag color="red">Over Due</Tag>
                                  )}
                              </div>
                            )}

                          {/* Order Total (if available) */}
                          {/* <div className="pt-2 border-t border-gray-700">
                            <div className="flex justify-between items-center">
                              <Text className="text-gray-400 text-sm">
                                Total
                              </Text>
                              <Text className="text-white font-semibold">
                                ₹{(order as any).total_amount || "0.00"}
                              </Text>
                            </div>
                          </div> */}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
