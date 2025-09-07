import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Tag,
  Select,
  Row,
  Col,
  Skeleton,
  Button,
  Spin,
} from "antd";
import { Package, RefreshCw } from "lucide-react";
import { MainLayout } from "../Layout/MainLayout";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { useOrders } from "../../hooks/useOrders";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const {
    data: orders,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refresh,
    loadMoreRef,
  } = useOrders();

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) => statusFilter === "ALL" || order.status === statusFilter
    );
  }, [orders, statusFilter]);

  const handleOrderClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = async () => {
    // Refresh orders list when order is updated
    refresh();
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
    <Card className="theme-card mb-4">
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  return (
    <MainLayout title="My Orders">
      <div className="space-y-4">
        {/* Order History */}
        <div>
          <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 pb-4 pt-4 -mx-4 px-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Title level={4} className="!theme-text-primary !mb-0">
                  Orders
                </Title>
                <Tag color="green" className="px-2 py-1 text-sm font-medium">
                  {total}
                </Tag>
                <Button
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={refresh}
                  loading={loading}
                  size="small"
                  className="theme-button"
                >
                  Refresh
                </Button>
              </div>

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-32 theme-input"
                size="middle"
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

          {error && (
            <Card className="theme-card text-center py-8 mb-4">
              <Title level={4} className="!theme-text-red-500 !mb-2">
                Error Loading Orders
              </Title>
              <Text className="theme-text-tertiary mb-4 block">{error}</Text>
              <Button
                onClick={refresh}
                loading={loading}
                className="theme-button"
              >
                Try Again
              </Button>
            </Card>
          )}

          {loading && orders.length === 0 ? (
            <Row gutter={[16, 16]}>
              {[...Array(6)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <OrderSkeleton />
                </Col>
              ))}
            </Row>
          ) : (
            <>
              {filteredOrders.length === 0 && !loading ? (
                <Card className="theme-card text-center py-12">
                  <Title level={4} className="!theme-text-secondary !mb-2">
                    No Orders Found
                  </Title>
                  <Text className="theme-text-tertiary">
                    {statusFilter !== "ALL"
                      ? "No orders with this status"
                      : "No orders available at the moment"}
                  </Text>
                </Card>
              ) : (
                <>
                  <Row gutter={[16, 16]}>
                    {filteredOrders.map((order) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
                        <Card
                          hoverable
                          onClick={() => handleOrderClick(order.id)}
                          className="theme-card-hover cursor-pointer transition-all duration-300 hover:border-purple-500 h-full"
                        >
                          <div className="space-y-3">
                            {/* Order Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Title
                                  level={5}
                                  className="!theme-text-primary !mb-1"
                                >
                                  Order {formatOrderId(order.id)}
                                </Title>
                                <Text className="theme-text-secondary text-sm">
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
                                    <Package className="w-4 h-4 theme-text-tertiary" />
                                    <Text className="theme-text-tertiary text-sm">
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

                  {/* Infinite scroll trigger */}
                  {hasMore && (
                    <div ref={loadMoreRef} className="text-center py-8">
                      {loadingMore ? (
                        <Spin size="large" />
                      ) : (
                        <Button
                          onClick={() => {
                            // This will be triggered by intersection observer
                          }}
                          className="theme-button"
                        >
                          Load More Orders
                        </Button>
                      )}
                    </div>
                  )}

                  {!hasMore && orders.length > 0 && (
                    <div className="text-center py-8">
                      <Text className="theme-text-tertiary">
                        You've reached the end of the orders list
                      </Text>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Order Detail Drawer */}
        <OrderDetailDrawer
          visible={drawerVisible}
          onClose={handleDrawerClose}
          orderId={selectedOrderId}
          onOrderUpdate={handleOrderUpdate}
        />
      </div>
    </MainLayout>
  );
};
