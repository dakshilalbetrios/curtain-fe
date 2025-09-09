import React, { useState, useCallback } from "react";
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
  Input,
  Modal,
  Form,
  message,
  Empty,
  InputNumber,
} from "antd";
import {
  Package,
  RefreshCw,
  Truck,
  X,
  Edit,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { MainLayout } from "../Layout/MainLayout";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { useOrdersFiltered } from "../../hooks/useOrders";
import { useSearchParams } from "react-router-dom";
import { ORDER_DELIVERED_DAY } from "../../constants";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import {
  OrderResponse,
  UpdateOrderRequest,
  CollectionResponse,
  userService,
} from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search: AntSearch } = Input;

export const OrderList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status_in") || "ALL"
  );
  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [accessibleCollections, setAccessibleCollections] = useState<
    CollectionResponse[]
  >([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<{
    [key: number]: CollectionResponse | null;
  }>({});
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState<{
    [key: number]: number | null;
  }>({});

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setSearchText(searchTerm);
        }, 500); // 500ms debounce
      };
    })(),
    []
  );

  const {
    data: orders,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refresh,
    loadMoreRef,
  } = useOrdersFiltered(searchText, statusFilter);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("ALL");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchText || (statusFilter && statusFilter !== "ALL");

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

  const fetchCollections = async () => {
    if (collections.length > 0) return; // Already loaded

    setLoadingCollections(true);
    try {
      if (!user?.id) {
        message.error("User not authenticated");
        return;
      }

      // Get user's collection access and all collections in parallel
      const [accessData, allCollections] = await Promise.all([
        userService.getUserCollectionAccess(user.id),
        (await import("../../services")).collectionService.getAllCollections(),
      ]);

      // Filter collections that user has ACTIVE access to
      const activeCollectionIds = accessData
        .filter((access) => access.status === "ACTIVE")
        .map((access) => access.collection_id);

      const accessible = allCollections.filter((collection) =>
        activeCollectionIds.includes(collection.id)
      );

      setCollections(allCollections); // Keep all collections for existing order items
      setAccessibleCollections(accessible); // Only accessible collections for new items
    } catch (error) {
      console.error("Failed to load collections:", error);
      message.error("Failed to load collections");
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleCollectionChange = (itemIndex: number, collectionId: number) => {
    // For existing items, use all collections; for new items, use accessible collections
    const isExistingItem =
      form.getFieldValue("order_items")[itemIndex]?.isExisting;
    const collectionSource = isExistingItem
      ? collections
      : accessibleCollections;
    const collection = collectionSource.find((c) => c.id === collectionId);

    if (collection) {
      setSelectedCollections((prev) => ({
        ...prev,
        [itemIndex]: collection,
      }));
      // Reset serial number selection when collection changes
      setSelectedSerialNumbers((prev) => ({
        ...prev,
        [itemIndex]: null,
      }));
      // Update form values
      form.setFieldsValue({
        order_items: form
          .getFieldValue("order_items")
          .map((item: any, index: number) =>
            index === itemIndex
              ? {
                  ...item,
                  collection_id: collectionId,
                  collection_sr_no_id: null,
                }
              : item
          ),
      });
    }
  };

  const handleSerialNumberChange = (
    itemIndex: number,
    serialNumberId: number
  ) => {
    setSelectedSerialNumbers((prev) => ({
      ...prev,
      [itemIndex]: serialNumberId,
    }));
    // Update form values
    form.setFieldsValue({
      order_items: form
        .getFieldValue("order_items")
        .map((item: any, index: number) =>
          index === itemIndex
            ? { ...item, collection_sr_no_id: serialNumberId }
            : item
        ),
    });
  };

  // Quantity helpers (match NewOrderModal behaviour)
  const getSelectedSerial = (itemIndex: number) => {
    return selectedCollections[itemIndex]?.serial_numbers?.find(
      (sr) => sr.id === selectedSerialNumbers[itemIndex]
    );
  };

  const getAvailableStockFor = (itemIndex: number): number => {
    const sr = getSelectedSerial(itemIndex);
    if (!sr) return 0;
    const n = parseFloat(sr.current_stock as unknown as string);
    return isNaN(n) ? 0 : n;
  };

  const getUnitFor = (itemIndex: number): string => {
    const sr = getSelectedSerial(itemIndex);
    return sr?.unit || "";
  };

  const handleQuantityDirectChange = (
    itemIndex: number,
    value: number | null
  ) => {
    const available = getAvailableStockFor(itemIndex);
    let newValue = value || 1;
    if (available > 0 && newValue > available) newValue = available;
    if (newValue < 1) newValue = 1;

    form.setFieldsValue({
      order_items: form
        .getFieldValue("order_items")
        .map((item: any, index: number) =>
          index === itemIndex ? { ...item, quantity: newValue } : item
        ),
    });
  };

  const adjustQuantity = (itemIndex: number, delta: number) => {
    const currentRaw = form.getFieldValue([
      "order_items",
      itemIndex,
      "quantity",
    ]);
    let current = parseFloat((currentRaw ?? 0).toString());
    if (isNaN(current) || current < 1) current = 1;
    handleQuantityDirectChange(itemIndex, current + delta);
  };

  const handleEditOrder = async (orderId: number) => {
    try {
      // Fetch collections first if not already loaded
      await fetchCollections();

      const { orderService } = await import("../../services");
      const order = await orderService.getOrderById(orderId);
      setEditingOrder(order);
      setEditModalVisible(true);

      // Initialize form with new structure
      const orderItems =
        order.order_items?.map((item, index) => {
          // Find the collection for this serial number
          const collection = collections.find((col) =>
            col.serial_numbers?.some((sr) => sr.id === item.collection_sr_no_id)
          );

          if (collection) {
            setSelectedCollections((prev) => ({
              ...prev,
              [index]: collection,
            }));
            setSelectedSerialNumbers((prev) => ({
              ...prev,
              [index]: item.collection_sr_no_id,
            }));
          }

          return {
            id: item.id,
            collection_id: collection?.id || null,
            collection_sr_no_id: item.collection_sr_no_id,
            quantity: item.quantity,
            isExisting: true,
          };
        }) || [];

      form.setFieldsValue({
        order_items: orderItems,
      });
    } catch (error) {
      console.error("Failed to load order data:", error);
      message.error("Failed to load order data");
    }
  };

  const handleOrderSubmit = async (values: any) => {
    if (!editingOrder) return;

    setFormLoading(true);
    try {
      const updatePayload: UpdateOrderRequest = {
        order_items: values.order_items.map((item: any) => {
          if (item.isExisting) {
            // Existing order item - update action
            return {
              _action: "update" as const,
              id: item.id,
              collection_sr_no_id: item.collection_sr_no_id,
              quantity: item.quantity,
            };
          } else {
            // New order item - create action
            return {
              _action: "create" as const,
              collection_sr_no_id: item.collection_sr_no_id,
              quantity: item.quantity,
            };
          }
        }),
      };

      // Add delete actions for removed order items
      const originalOrderItems = editingOrder.order_items || [];
      const currentItemIds = values.order_items
        .filter((item: any) => item.isExisting)
        .map((item: any) => item.id);

      const deletedItems = originalOrderItems
        .filter((item) => !currentItemIds.includes(item.id))
        .map((item) => ({
          _action: "delete" as const,
          id: item.id,
          collection_sr_no_id: item.collection_sr_no_id,
          quantity: 0,
        }));

      updatePayload.order_items = [
        ...updatePayload.order_items,
        ...deletedItems,
      ];

      const { orderService } = await import("../../services");
      await orderService.updateOrder(editingOrder.id, updatePayload);
      message.success("Order updated successfully!");

      setEditModalVisible(false);
      setEditingOrder(null);
      setSelectedCollections({});
      setSelectedSerialNumbers({});
      form.resetFields();

      // Refresh orders list
      refresh();
    } catch (error) {
      console.error("Failed to update order:", error);
      message.error("Failed to update order");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOrder = (orderId: number, orderNumber: string) => {
    Modal.confirm({
      title: "Delete Order",
      content: `Are you sure you want to delete Order #${orderNumber}? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { orderService } = await import("../../services");
          await orderService.deleteOrder(orderId);
          message.success(`Order #${orderNumber} deleted successfully!`);

          // Refresh the orders list
          refresh();
        } catch (error) {
          console.error("Delete error:", error);
          message.error(
            `Failed to delete Order #${orderNumber}. Please try again.`
          );
        }
      },
    });
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

  // Skeleton loading component
  const OrderSkeleton = () => (
    <Card className="theme-card mb-4">
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  return (
    <MainLayout title="">
      <div className="flex flex-col h-full min-h-0 max-h-full">
        {/* Fixed Header Section */}
        <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 -mx-4 px-4 pb-6 flex-shrink-0">
          <div className="space-y-4">
            {/* Large Screen: All in one row */}
            <div className="hidden xl:flex xl:items-center xl:justify-between gap-4">
              {/* Left Section - Title and Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <Title
                      level={3}
                      className="!theme-text-primary !mb-0 !text-2xl"
                    >
                      Orders
                    </Title>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag
                    color="green"
                    className="px-3 py-1 text-sm font-medium rounded-full"
                  >
                    {total} Total
                  </Tag>
                  <Button
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={refresh}
                    loading={loading}
                    size="small"
                    className="theme-button border theme-border-primary hover:theme-bg-tertiary"
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Right Section - Search, Filter, Clear */}
              <div className="flex flex-row gap-3 items-center">
                <AntSearch
                  placeholder="Search by Order ID or Tracking No..."
                  value={searchText}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-80"
                  size="large"
                  allowClear
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-32 theme-input"
                  size="large"
                  placeholder="Filter by status"
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="OVER_DUE">Over Due</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="SHIPPED">Shipped</Option>
                  <Option value="DELIVERED">Delivered</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                </Select>
                {hasActiveFilters && (
                  <Button
                    icon={<X className="w-4 h-4" />}
                    onClick={clearFilters}
                    size="large"
                    className="theme-button border theme-border-primary hover:theme-bg-tertiary"
                    title="Clear all filters"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Medium Screen: Search, Filter, Clear in one row */}
            <div className="hidden md:block xl:hidden">
              {/* Title and Stats Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <Title
                        level={3}
                        className="!theme-text-primary !mb-0 !text-2xl"
                      >
                        Orders
                      </Title>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag
                      color="green"
                      className="px-3 py-1 text-sm font-medium rounded-full"
                    >
                      {total} Total
                    </Tag>
                    <Button
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={refresh}
                      loading={loading}
                      size="small"
                      className="theme-button border theme-border-primary hover:theme-bg-tertiary"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search, Filter, Clear Row */}
              <div className="flex flex-row gap-3 items-center">
                <AntSearch
                  placeholder="Search by Order ID or Tracking No..."
                  value={searchText}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="flex-1 min-w-0"
                  size="large"
                  allowClear
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-32 theme-input flex-shrink-0"
                  size="large"
                  placeholder="Filter by status"
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="OVER_DUE">Over Due</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="SHIPPED">Shipped</Option>
                  <Option value="DELIVERED">Delivered</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                </Select>
                {hasActiveFilters && (
                  <Button
                    icon={<X className="w-4 h-4" />}
                    onClick={clearFilters}
                    size="large"
                    className="theme-button border theme-border-primary hover:theme-bg-tertiary flex-shrink-0"
                    title="Clear all filters"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Small Screen: Search and Filter in different rows */}
            <div className="block md:hidden">
              {/* Title and Stats Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <Title
                        level={3}
                        className="!theme-text-primary !mb-0 !text-2xl"
                      >
                        Orders
                      </Title>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag
                      color="green"
                      className="px-3 py-1 text-sm font-medium rounded-full"
                    >
                      {total} Total
                    </Tag>
                    <Button
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={refresh}
                      loading={loading}
                      size="small"
                      className="theme-button border theme-border-primary hover:theme-bg-tertiary"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Row */}
              <div className="mb-3">
                <AntSearch
                  placeholder="Search by Order ID or Tracking No..."
                  value={searchText}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full"
                  size="large"
                  allowClear
                />
              </div>

              {/* Filter and Clear Row */}
              <div className="flex flex-row gap-3 items-center">
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="flex-1 theme-input"
                  size="large"
                  placeholder="Filter by status"
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="OVER_DUE">Over Due</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="SHIPPED">Shipped</Option>
                  <Option value="DELIVERED">Delivered</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                </Select>
                {hasActiveFilters && (
                  <Button
                    icon={<X className="w-4 h-4" />}
                    onClick={clearFilters}
                    size="large"
                    className="theme-button border theme-border-primary hover:theme-bg-tertiary flex-shrink-0"
                    title="Clear all filters"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 min-h-0 max-h-full -mr-4 pr-4 pb-16 lg:pb-6">
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
              {[...Array(20)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <OrderSkeleton />
                </Col>
              ))}
            </Row>
          ) : (
            <>
              {orders.length === 0 && !loading ? (
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
                    {orders.map((order) => (
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
                                  Order #{order.id}
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
                                  {(() => {
                                    // If we're filtering by OVER_DUE, show the tag for all orders since they're already filtered
                                    // if (statusFilter === "OVER_DUE") {
                                    //   return <Tag color="red">Over Due</Tag>;
                                    // }

                                    // Otherwise, calculate if the order is overdue
                                    const orderDate = moment(order.created_at);
                                    const currentDate = moment();

                                    const daysDiff = currentDate.diff(
                                      orderDate,
                                      "days"
                                    );
                                    const isOverdue =
                                      daysDiff >= ORDER_DELIVERED_DAY;
                                    const isEligibleStatus =
                                      order.status === "PENDING" ||
                                      order.status === "APPROVED" ||
                                      order.status === "SHIPPED";

                                    return (
                                      isOverdue &&
                                      isEligibleStatus && (
                                        <Tag color="red">Over Due</Tag>
                                      )
                                    );
                                  })()}
                                </div>
                              )}

                            {/* Courier Information */}
                            {(order.courier_tracking_no ||
                              order.courier_company) && (
                              <div className="pt-2 border-t theme-border-secondary">
                                <div className="flex items-start space-x-2">
                                  <Truck className="w-4 h-4 theme-text-tertiary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    {/* Mobile Layout - Stacked */}
                                    <div className="block sm:hidden space-y-1">
                                      {order.courier_company && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs theme-text-tertiary">
                                            Company:
                                          </span>
                                          <Text className="theme-text-secondary text-xs truncate">
                                            {order.courier_company}
                                          </Text>
                                        </div>
                                      )}
                                      {order.courier_tracking_no && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs theme-text-tertiary">
                                            Tracking:
                                          </span>
                                          <Text className="theme-text-primary text-xs font-medium truncate">
                                            {order.courier_tracking_no}
                                          </Text>
                                        </div>
                                      )}
                                    </div>

                                    {/* Desktop Layout - Side by Side */}
                                    <div className="hidden sm:flex items-center justify-between gap-4">
                                      {order.courier_company && (
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span className="text-xs theme-text-tertiary whitespace-nowrap">
                                            Company:
                                          </span>
                                          <Text className="theme-text-secondary text-xs truncate">
                                            {order.courier_company}
                                          </Text>
                                        </div>
                                      )}
                                      {order.courier_tracking_no && (
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span className="text-xs theme-text-tertiary whitespace-nowrap">
                                            Tracking:
                                          </span>
                                          <Text className="theme-text-primary text-xs font-medium truncate">
                                            {order.courier_tracking_no}
                                          </Text>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Admin Actions - Only show for pending orders */}
                            {order.status === "PENDING" && (
                              <div className="flex items-center justify-between space-x-2 pt-2 border-t theme-border-secondary">
                                <Button
                                  type="link"
                                  icon={<Edit className="w-4 h-4" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOrder(order.id);
                                  }}
                                  className="!text-purple-400 hover:!text-purple-300 !p-0 !h-auto flex items-center gap-1"
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="link"
                                  icon={<Trash2 className="w-4 h-4" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(
                                      order.id,
                                      order.id.toString()
                                    );
                                  }}
                                  className="!text-red-400 hover:!text-red-300 !p-0 !h-auto flex items-center gap-1"
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
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
          {/* Order Detail Drawer */}
          <OrderDetailDrawer
            visible={drawerVisible}
            onClose={handleDrawerClose}
            orderId={selectedOrderId}
            onOrderUpdate={handleOrderUpdate}
          />

          {/* Edit Order Modal */}
          <Modal
            title={
              <div className="flex items-center mb-2">
                <Edit className="w-5 h-5 mr-2 text-purple-400" />
                <span className="theme-text-primary">
                  Edit Order #{editingOrder?.id}
                </span>
              </div>
            }
            open={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setEditingOrder(null);
              setSelectedCollections({});
              setSelectedSerialNumbers({});
              form.resetFields();
            }}
            footer={null}
            width={900}
            className="edit-order-modal"
          >
            {loadingCollections ? (
              <div className="space-y-4">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ) : accessibleCollections.length === 0 ? (
              <Empty
                image={
                  <Package className="w-16 h-16 theme-text-tertiary mx-auto" />
                }
                description={
                  <div className="text-center">
                    <Title level={5} className="!theme-text-secondary !mb-2">
                      No Collections Available
                    </Title>
                    <Text className="theme-text-tertiary">
                      You don't have access to any collections yet. Contact your
                      administrator to get access.
                    </Text>
                  </div>
                }
              />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleOrderSubmit}
                initialValues={{
                  order_items: [
                    {
                      collection_id: null,
                      collection_sr_no_id: null,
                      quantity: "",
                      isExisting: false,
                    },
                  ],
                }}
                autoComplete="off"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Title level={5} className="!theme-text-primary !mb-0">
                      Order Items
                    </Title>
                    <Button
                      type="dashed"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => {
                        const currentOrderItems =
                          form.getFieldValue("order_items") || [];
                        const newIndex = currentOrderItems.length;
                        form.setFieldsValue({
                          order_items: [
                            ...currentOrderItems,
                            {
                              collection_id: null,
                              collection_sr_no_id: null,
                              quantity: "",
                              isExisting: false,
                            },
                          ],
                        });
                        // Initialize state for new item
                        setSelectedCollections((prev) => ({
                          ...prev,
                          [newIndex]: null,
                        }));
                        setSelectedSerialNumbers((prev) => ({
                          ...prev,
                          [newIndex]: null,
                        }));
                      }}
                      className="border-purple-500 text-purple-400 hover:border-purple-400"
                    >
                      Add Item
                    </Button>
                  </div>

                  <Form.List name="order_items">
                    {(fields, { remove }) => (
                      <div className="space-y-4">
                        {fields.map(({ key, name, ...restField }) => (
                          <Card
                            key={key}
                            className="theme-card"
                            title={
                              <div className="flex items-center justify-between">
                                <Text className="theme-text-primary">
                                  Order Item {name + 1}
                                </Text>
                                {fields.length > 1 && (
                                  <Button
                                    type="text"
                                    icon={<Trash2 className="w-4 h-4" />}
                                    onClick={() => remove(name)}
                                    className="text-red-400 hover:text-red-300"
                                  />
                                )}
                              </div>
                            }
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Collection Selection */}
                              <div className="space-y-2">
                                <Text className="theme-text-secondary font-medium">
                                  Collection
                                </Text>
                                <Select
                                  placeholder="Select a collection"
                                  value={selectedCollections[name]?.id}
                                  onChange={(collectionId) =>
                                    handleCollectionChange(name, collectionId)
                                  }
                                  className="w-full theme-input"
                                  size="large"
                                  showSearch
                                  loading={loadingCollections}
                                  filterOption={(input, option) =>
                                    (option?.label as string)
                                      ?.toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                >
                                  {(form.getFieldValue("order_items")[name]
                                    ?.isExisting
                                    ? collections
                                    : accessibleCollections
                                  ).map((collection) => (
                                    <Option
                                      key={collection.id}
                                      value={collection.id}
                                    >
                                      {collection.name}
                                    </Option>
                                  ))}
                                </Select>
                              </div>

                              {/* Serial Number Selection */}
                              <div className="space-y-2">
                                <Text className="theme-text-secondary font-medium">
                                  Serial Number
                                </Text>
                                <Select
                                  placeholder="Select serial number"
                                  value={
                                    selectedSerialNumbers[name] ?? undefined
                                  }
                                  onChange={(serialNumberId) =>
                                    handleSerialNumberChange(
                                      name,
                                      serialNumberId
                                    )
                                  }
                                  className="w-full theme-input"
                                  size="large"
                                  showSearch
                                  disabled={!selectedCollections[name]}
                                  filterOption={(input, option) =>
                                    (option?.label as string)
                                      ?.toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                >
                                  {selectedCollections[
                                    name
                                  ]?.serial_numbers?.map((serialNumber) => (
                                    <Option
                                      key={serialNumber.id}
                                      value={serialNumber.id}
                                    >
                                      {serialNumber.sr_no}
                                    </Option>
                                  ))}
                                </Select>
                              </div>

                              {/* Quantity Input */}
                              <div className="space-y-2">
                                <Text className="theme-text-secondary font-medium">
                                  Quantity
                                </Text>
                                <Form.Item
                                  {...restField}
                                  name={[name, "quantity"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter quantity",
                                    },
                                    {
                                      pattern: /^\d+(\.\d+)?$/,
                                      message: "Please enter valid number",
                                    },
                                  ]}
                                  className="mb-0"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      icon={<Minus className="w-4 h-4" />}
                                      onClick={() => adjustQuantity(name, -0.5)}
                                      disabled={
                                        !(
                                          form.getFieldValue([
                                            "order_items",
                                            name,
                                            "quantity",
                                          ]) || 0
                                        ) ||
                                        form.getFieldValue([
                                          "order_items",
                                          name,
                                          "quantity",
                                        ]) <= 1
                                      }
                                      className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                                      style={{
                                        minWidth: "40px",
                                        minHeight: "40px",
                                      }}
                                    />
                                    <InputNumber
                                      min={1}
                                      value={
                                        form.getFieldValue([
                                          "order_items",
                                          name,
                                          "quantity",
                                        ]) || 1
                                      }
                                      onChange={(v) =>
                                        handleQuantityDirectChange(
                                          name,
                                          v as number | null
                                        )
                                      }
                                      className="w-8 theme-input !align-center !justify-center !border-none"
                                      controls={false}
                                      size="small"
                                      style={{
                                        height: "40px",
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                      disabled={!selectedSerialNumbers[name]}
                                    />
                                    <Button
                                      icon={<Plus className="w-4 h-4" />}
                                      onClick={() => adjustQuantity(name, 0.5)}
                                      disabled={(() => {
                                        const qty = parseFloat(
                                          (
                                            form.getFieldValue([
                                              "order_items",
                                              name,
                                              "quantity",
                                            ]) || 0
                                          ).toString()
                                        );
                                        const max = getAvailableStockFor(name);
                                        return (
                                          !selectedSerialNumbers[name] ||
                                          (max > 0 && qty >= max)
                                        );
                                      })()}
                                      className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                                      style={{
                                        minWidth: "40px",
                                        minHeight: "40px",
                                      }}
                                    />
                                    <Text className="theme-text-secondary text-sm ml-2">
                                      {getUnitFor(name)}
                                    </Text>
                                  </div>
                                </Form.Item>
                                {/* Show available stock */}
                                {selectedCollections[name] &&
                                  selectedSerialNumbers[name] && (
                                    <Text className="text-xs theme-text-tertiary">
                                      Available Stock:{" "}
                                      {
                                        selectedCollections[
                                          name
                                        ]?.serial_numbers?.find(
                                          (sr) =>
                                            sr.id ===
                                            selectedSerialNumbers[name]
                                        )?.current_stock
                                      }{" "}
                                      {
                                        selectedCollections[
                                          name
                                        ]?.serial_numbers?.find(
                                          (sr) =>
                                            sr.id ===
                                            selectedSerialNumbers[name]
                                        )?.unit
                                      }
                                    </Text>
                                  )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Form.List>
                </div>

                <Form.Item className="mb-0">
                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={() => {
                        setEditModalVisible(false);
                        setEditingOrder(null);
                        setSelectedCollections({});
                        setSelectedSerialNumbers({});
                        form.resetFields();
                      }}
                      size="large"
                      className="theme-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={formLoading}
                      size="large"
                      className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                    >
                      Update Order
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            )}
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
};
