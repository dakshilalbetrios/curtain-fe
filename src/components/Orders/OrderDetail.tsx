import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Timeline,
  Row,
  Col,
  Skeleton,
  Modal,
  Select,
  message,
} from "antd";
import { useParams } from "react-router-dom";
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { orderService, OrderResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import moment from "moment";

const { Title, Text } = Typography;

const { Option } = Select;

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const orderId = parseInt(id || "0");

  const isAdmin = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !order) return;

    setUpdating(true);
    try {
      await orderService.updateOrderStatus(order.id, selectedStatus as any);
      message.success(`Order status updated to ${selectedStatus}`);
      setStatusModalVisible(false);
      setSelectedStatus("");

      // Refresh order data
      const updatedOrder = await orderService.getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (error) {
      message.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = () => {
    setSelectedStatus(order?.status || "");
    setStatusModalVisible(true);
  };

  // Skeleton loading component
  const OrderItemSkeleton = () => (
    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
      <div className="flex-1">
        <Skeleton.Input active size="small" className="!w-48 !h-4 !mb-2" />
        <Skeleton.Input active size="small" className="!w-32 !h-3" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout title="Loading..." showBack={true}>
        <div className="space-y-6">
          {/* Order Header Skeleton */}
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Skeleton.Input
                  active
                  size="default"
                  className="!w-48 !h-8 !mb-2"
                />
                <Skeleton.Input active size="small" className="!w-32 !h-4" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton.Button active size="default" className="!w-20 !h-6" />
                <Skeleton.Button active size="default" className="!w-16 !h-8" />
              </div>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Skeleton.Button
                  active
                  size="large"
                  className="!w-full !h-10"
                />
              </Col>
              <Col xs={12}>
                <Skeleton.Button
                  active
                  size="large"
                  className="!w-full !h-10"
                />
              </Col>
            </Row>
          </Card>

          {/* Order Status Timeline Skeleton */}
          <Card className="bg-gray-800 border-gray-700">
            <Skeleton.Input
              active
              size="default"
              className="!w-32 !h-6 !mb-4"
            />
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Skeleton.Avatar active size="small" />
                  <div className="flex-1">
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-24 !h-4 !mb-1"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-32 !h-3 !mb-1"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-48 !h-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Items Skeleton */}
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <Skeleton.Input active size="default" className="!w-32 !h-6" />
              <Skeleton.Button active size="small" className="!w-16 !h-6" />
            </div>
            <Row gutter={[16, 16]}>
              {[...Array(4)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card className="bg-gray-700 border-gray-600">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Skeleton.Avatar active size="default" />
                        <div className="flex-1">
                          <Skeleton.Input
                            active
                            size="small"
                            className="!w-24 !h-4 !mb-2"
                          />
                          <Skeleton.Input
                            active
                            size="small"
                            className="!w-16 !h-3"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-600">
                        <div className="flex justify-between items-center">
                          <Skeleton.Input
                            active
                            size="small"
                            className="!w-12 !h-3"
                          />
                          <Skeleton.Input
                            active
                            size="small"
                            className="!w-16 !h-4"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout title="Order Not Found" showBack={true}>
        <div className="text-center py-8">
          <Title level={3} className="!text-gray-400">
            Order Not Found
          </Title>
        </div>
      </MainLayout>
    );
  }

  const formatOrderId = (id: number) => {
    return `#${id.toString().padStart(6, "0")}`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <Package className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const timelineItems = [
    {
      dot: getStatusIcon("PENDING"),
      children: (
        <div>
          <Text className="text-white font-medium">Pending</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).format("MMM DD, YYYY, hh:mm A")}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            We have received your order.
          </Text>
        </div>
      ),
    },
    ...(order.status !== "CANCELLED" && order.status !== "PENDING"
      ? [
          {
            dot: getStatusIcon("APPROVED"),
            children: (
              <div>
                <Text className="text-white font-medium">Approved</Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  {moment(order.created_at)
                    .add(5, "hours")
                    .format("MMM DD, YYYY, hh:mm A")}
                </Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  Your order has been approved.
                </Text>
              </div>
            ),
          },
        ]
      : []),
    ...(order.status === "SHIPPED" || order.status === "DELIVERED"
      ? [
          {
            dot: getStatusIcon("SHIPPED"),
            children: (
              <div>
                <Text className="text-white font-medium">Shipped</Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  {moment(order.created_at)
                    .add(1, "day")
                    .format("MMM DD, YYYY, hh:mm A")}
                </Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  Your order has been shipped from our warehouse.
                </Text>
              </div>
            ),
          },
        ]
      : []),
    ...(order.status === "DELIVERED"
      ? [
          {
            dot: getStatusIcon("DELIVERED"),
            children: (
              <div>
                <Text className="text-white font-medium">Delivered</Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  {moment(order.created_at)
                    .add(3, "days")
                    .format("MMM DD, YYYY, hh:mm A")}
                </Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  Your order has been delivered.
                </Text>
              </div>
            ),
          },
        ]
      : []),
    ...(order.status === "CANCELLED"
      ? [
          {
            dot: getStatusIcon("CANCELLED"),
            children: (
              <div>
                <Text className="text-white font-medium">Cancelled</Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  {moment(order.created_at)
                    .add(2, "hours")
                    .format("MMM DD, YYYY, hh:mm A")}
                </Text>
                <br />
                <Text className="text-gray-400 text-sm">
                  Order has been cancelled.
                </Text>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <MainLayout title="Order Details" showBack={true}>
      <div className="space-y-6">
        {/* Order Header */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={3} className="!text-white !mb-1">
                Order {formatOrderId(order.id)}
              </Title>
              <Text className="text-gray-400">
                Placed on {moment(order.created_at).format("MMM DD, YYYY")}
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <Tag
                color={getStatusColor(order.status)}
                className="px-3 py-1 rounded-full text-sm font-medium"
              >
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </Tag>
              {isAdmin && (
                <Button
                  type="primary"
                  icon={<Settings className="w-4 h-4" />}
                  onClick={openStatusModal}
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Manage
                </Button>
              )}
            </div>
          </div>
          {/* 
          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Button
                icon={<Download className="w-4 h-4" />}
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                disabled={
                  order.status === "PENDING" || order.status === "CANCELLED"
                }
              >
                Download Invoice
              </Button>
            </Col>
          </Row> */}
        </Card>

        {/* Order Status Timeline */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4">
            Order Status
          </Title>
          <Timeline items={timelineItems} className="custom-timeline" />
        </Card>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="!text-white !mb-0">
                Order Items
              </Title>
              <Tag color="blue" className="px-2 py-1 text-sm font-medium">
                {order.order_items.length} item
                {order.order_items.length > 1 ? "s" : ""}
              </Tag>
            </div>
            <Row gutter={[16, 16]}>
              {order.order_items.map((item) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <Card className="bg-gray-700 border-gray-600 hover:border-purple-500 transition-all duration-300 h-full">
                    <div className="space-y-3">
                      {/* Collection Info */}
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-white font-medium text-sm block truncate">
                            {item.collection_details.name}
                          </Text>
                          <Text className="text-gray-400 text-xs">
                            {item.collection_details.sr_no}
                          </Text>
                        </div>
                      </div>

                      {/* Quantity and Unit */}
                      <div className="pt-2 border-t border-gray-600">
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-400 text-sm">
                            Quantity
                          </Text>
                          <Text className="text-white font-semibold">
                            {item.quantity} {item.collection_details.unit}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>

      {/* Status Management Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedStatus("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setStatusModalVisible(false);
              setSelectedStatus("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            loading={updating}
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || selectedStatus === order?.status}
            className="bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Update Status
          </Button>,
        ]}
        className="status-modal"
      >
        <div className="space-y-4">
          <div>
            <Text className="text-gray-600 mb-2 block">Current Status:</Text>
            <Tag color={getStatusColor(order?.status || "")} className="mb-4">
              {order?.status}
            </Tag>
          </div>

          <div>
            <Text className="text-gray-600 mb-2 block">Select New Status:</Text>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
              placeholder="Select status"
            >
              <Option value="PENDING">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending</span>
                </div>
              </Option>
              <Option value="APPROVED">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approved</span>
                </div>
              </Option>
              <Option value="SHIPPED">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Shipped</span>
                </div>
              </Option>
              <Option value="DELIVERED">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Delivered</span>
                </div>
              </Option>
              <Option value="CANCELLED">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Cancelled</span>
                </div>
              </Option>
            </Select>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
