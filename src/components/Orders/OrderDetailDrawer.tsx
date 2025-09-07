import React, { useState, useEffect } from "react";
import {
  Drawer,
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
  Input,
  Form,
  message,
} from "antd";
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
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  orderId: number | null;
  onOrderUpdate?: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  visible,
  onClose,
  orderId,
  onOrderUpdate,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [courierTrackingNo, setCourierTrackingNo] = useState<string>("");
  const [courierCompany, setCourierCompany] = useState<string>("");
  const [form] = Form.useForm();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setLoading(true);
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        message.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (visible && orderId) {
      fetchOrder();
    }
  }, [visible, orderId]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !order) return;

    // Validate courier fields for SHIPPED status
    if (selectedStatus === "SHIPPED") {
      if (!courierTrackingNo.trim() || !courierCompany.trim()) {
        message.error(
          "Please fill in both courier tracking No and courier company"
        );
        return;
      }
    }

    setUpdating(true);
    try {
      // Prepare payload with courier fields for SHIPPED status
      const payload: any = {
        status: selectedStatus,
      };

      if (selectedStatus === "SHIPPED") {
        payload.courier_tracking_no = courierTrackingNo.trim();
        payload.courier_company = courierCompany.trim();
      }

      await orderService.updateOrderStatus(order.id, payload);
      message.success(`Order status updated to ${selectedStatus}`);
      setStatusModalVisible(false);
      setSelectedStatus("");
      setCourierTrackingNo("");
      setCourierCompany("");
      form.resetFields();

      // Refresh order data
      const updatedOrder = await orderService.getOrderById(orderId!);
      setOrder(updatedOrder);

      // Notify parent component to refresh order list
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      message.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = () => {
    setSelectedStatus(order?.status || "");
    setCourierTrackingNo("");
    setCourierCompany("");
    form.resetFields();
    setStatusModalVisible(true);
  };

  const handleClose = () => {
    setOrder(null);
    onClose();
  };

  const isUpdateButtonEnabled = () => {
    if (!selectedStatus || selectedStatus === order?.status) {
      return false;
    }

    // For SHIPPED status, both courier fields must be filled
    if (selectedStatus === "SHIPPED") {
      return courierTrackingNo.trim() !== "" && courierCompany.trim() !== "";
    }

    return true;
  };

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

  const timelineItems = order
    ? [
        {
          dot: getStatusIcon("PENDING"),
          children: (
            <div>
              <Text className="theme-text-primary font-medium">Pending</Text>
              <br />
              <Text className="theme-text-secondary text-sm">
                {moment(order.created_at).format("MMM DD, YYYY, hh:mm A")}
              </Text>
              <br />
              <Text className="theme-text-secondary text-sm">
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
                    <Text className="theme-text-primary font-medium">
                      Approved
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      {moment(order.created_at)
                        .add(5, "hours")
                        .format("MMM DD, YYYY, hh:mm A")}
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
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
                    <Text className="theme-text-primary font-medium">
                      Shipped
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      {moment(order.created_at)
                        .add(1, "day")
                        .format("MMM DD, YYYY, hh:mm A")}
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      Your order has been shipped from our warehouse.
                    </Text>
                    {/* Courier Information */}
                    {order.courier_tracking_no && order.courier_company && (
                      <>
                        <br />
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <Text className="theme-text-primary text-sm font-medium block">
                            📦 Courier Details:
                          </Text>
                          <Text className="theme-text-secondary text-xs">
                            <strong>Company:</strong> {order.courier_company}
                          </Text>
                          <br />
                          <Text className="theme-text-secondary text-xs">
                            <strong>Tracking No:</strong>{" "}
                            {order.courier_tracking_no}
                          </Text>
                        </div>
                      </>
                    )}
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
                    <Text className="theme-text-primary font-medium">
                      Delivered
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      {moment(order.created_at)
                        .add(3, "days")
                        .format("MMM DD, YYYY, hh:mm A")}
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
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
                    <Text className="theme-text-primary font-medium">
                      Cancelled
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      {moment(order.created_at)
                        .add(2, "hours")
                        .format("MMM DD, YYYY, hh:mm A")}
                    </Text>
                    <br />
                    <Text className="theme-text-secondary text-sm">
                      Order has been cancelled.
                    </Text>
                  </div>
                ),
              },
            ]
          : []),
      ]
    : [];

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="theme-text-primary font-semibold">
                Order Details
              </span>
            </div>
          </div>
        }
        placement="right"
        onClose={handleClose}
        open={visible}
        width="100%"
        className="order-detail-drawer"
        styles={{
          body: { padding: 0 },
          header: {
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px",
          },
        }}
        extra={
          isAdmin &&
          order && (
            <Button
              type="primary"
              icon={<Settings className="w-4 h-4" />}
              onClick={openStatusModal}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              size="small"
            >
              Manage
            </Button>
          )
        }
      >
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-6">
              {/* Order Header Skeleton */}
              <Card className="theme-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Skeleton.Input
                      active
                      size="default"
                      className="!w-48 !h-8 !mb-2"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-32 !h-4"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton.Button
                      active
                      size="default"
                      className="!w-20 !h-6"
                    />
                  </div>
                </div>
              </Card>

              {/* Order Status Timeline Skeleton */}
              <Card className="theme-card">
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
              <Card className="theme-card">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton.Input
                    active
                    size="default"
                    className="!w-32 !h-6"
                  />
                  <Skeleton.Button active size="small" className="!w-16 !h-6" />
                </div>
                <Row gutter={[16, 16]}>
                  {[...Array(4)].map((_, index) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                      <Card className="theme-card">
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
                          <div className="pt-2 border-t theme-border-secondary">
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
          ) : order ? (
            <>
              {/* Order Header */}
              <Card className="theme-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title level={3} className="!theme-text-primary !mb-1">
                      Order {formatOrderId(order.id)}
                    </Title>
                    <Text className="theme-text-secondary">
                      Placed on{" "}
                      {moment(order.created_at).format("MMM DD, YYYY")}
                    </Text>
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

              {/* Order Status Timeline */}
              <Card className="theme-card">
                <Title level={4} className="!theme-text-primary !mb-4">
                  Order Status
                </Title>
                <Timeline items={timelineItems} className="custom-timeline" />
              </Card>

              {/* Order Items */}
              {order.order_items && order.order_items.length > 0 && (
                <Card className="theme-card">
                  <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="!theme-text-primary !mb-0">
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
                        <Card className="theme-card hover:border-purple-500 transition-all duration-300 h-full">
                          <div className="space-y-3">
                            {/* Collection Info */}
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Text className="theme-text-primary font-medium text-sm block truncate">
                                  {item.collection_details.name}
                                </Text>
                                <Text className="theme-text-secondary text-xs">
                                  {item.collection_details.sr_no}
                                </Text>
                              </div>
                            </div>

                            {/* Quantity and Unit */}
                            <div className="pt-2 border-t theme-border-secondary">
                              <div className="flex justify-between items-center">
                                <Text className="theme-text-secondary text-sm">
                                  Quantity
                                </Text>
                                <Text className="theme-text-primary font-semibold">
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
            </>
          ) : (
            <div className="text-center py-8">
              <Title level={3} className="!theme-text-secondary">
                Order Not Found
              </Title>
            </div>
          )}
        </div>
      </Drawer>

      {/* Status Management Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedStatus("");
          setCourierTrackingNo("");
          setCourierCompany("");
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setStatusModalVisible(false);
              setSelectedStatus("");
              setCourierTrackingNo("");
              setCourierCompany("");
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            loading={updating}
            onClick={handleStatusUpdate}
            disabled={!isUpdateButtonEnabled()}
            className="bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Update Status
          </Button>,
        ]}
        className="status-modal"
      >
        <Form form={form} layout="vertical">
          <div className="space-y-4">
            <div>
              <Text className="theme-text-secondary mb-2 block">
                Current Status:
              </Text>
              <Tag color={getStatusColor(order?.status || "")} className="mb-4">
                {order?.status}
              </Tag>
            </div>

            <div>
              <Text className="theme-text-secondary mb-2 block">
                Select New Status:
              </Text>
              <Select
                value={selectedStatus}
                onChange={(value) => {
                  setSelectedStatus(value);
                  // Clear courier fields when status changes
                  if (value !== "SHIPPED") {
                    setCourierTrackingNo("");
                    setCourierCompany("");
                  }
                }}
                className="w-full theme-input"
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

            {/* Courier Fields - Only show when SHIPPED is selected */}
            {selectedStatus === "SHIPPED" && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Text className="theme-text-primary font-medium text-sm">
                  Courier Information (Required for Shipped Status)
                </Text>

                <Form.Item
                  label={
                    <span className="theme-text-secondary">
                      Courier Tracking ID
                    </span>
                  }
                  required
                >
                  <Input
                    value={courierTrackingNo}
                    onChange={(e) => setCourierTrackingNo(e.target.value)}
                    placeholder="Enter courier tracking ID"
                    className="theme-input"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="theme-text-secondary">Courier Name</span>
                  }
                  required
                >
                  <Input
                    value={courierCompany}
                    onChange={(e) => setCourierCompany(e.target.value)}
                    placeholder="Enter courier name (e.g., Blue Dart, FedEx, etc.)"
                    className="theme-input"
                    size="large"
                  />
                </Form.Item>
              </div>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};
