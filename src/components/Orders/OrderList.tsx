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
} from "antd";
import { Package, RefreshCw, Search, Truck, X } from "lucide-react";
import { MainLayout } from "../Layout/MainLayout";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { useOrdersFiltered } from "../../hooks/useOrders";
import { useSearchParams } from "react-router-dom";
import { ORDER_DELIVERED_DAY } from "../../constants";
import moment from "moment";

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
          <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 pb-6 -mx-4 px-4 mb-4">
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
