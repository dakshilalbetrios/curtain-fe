import React from "react";
import { Card, Row, Col, Typography, Statistic, Button, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Plus,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { orderService, userService, collectionService } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRetailers: 0,
    totalCollections: 0,
    loading: true,
  });

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orders, users, collections] = await Promise.all([
          orderService.getAllOrders(),
          userService.getAllUsers(),
          collectionService.getAllCollections(),
        ]);

        const pendingOrders = orders.filter(
          (order) => order.status === "PENDING"
        ).length;
        const retailers = users.filter((user) => user.role === "CUSTOMER");

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalRetailers: retailers.length,
          totalCollections: collections.length,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";
  const isRetailer = user?.role === "CUSTOMER";

  // Chart data for visualization
  const chartData = [
    { month: "Jan", orders: 12 },
    { month: "Feb", orders: 19 },
    { month: "Mar", orders: 15 },
    { month: "Apr", orders: 25 },
    { month: "May", orders: 18 },
    { month: "Jun", orders: 22 },
  ];

  const quickActions = isRetailer
    ? [
        {
          title: "My Orders",
          description: "View your order history",
          icon: <ShoppingBag className="w-8 h-8 text-purple-400" />,
          action: () => navigate("/orders"),
          color: "bg-purple-900/20 border-purple-500/30",
        },
        {
          title: "Collections",
          description: "Browse available collections",
          icon: <Package className="w-8 h-8 text-blue-400" />,
          action: () => navigate("/collections"),
          color: "bg-blue-900/20 border-blue-500/30",
        },
        {
          title: "New Order",
          description: "Place a new order",
          icon: <Plus className="w-8 h-8 text-green-400" />,
          action: () => navigate("/collections"),
          color: "bg-green-900/20 border-green-500/30",
        },
        {
          title: "Profile",
          description: "View your profile",
          icon: <Eye className="w-8 h-8 text-orange-400" />,
          action: () => navigate("/profile"),
          color: "bg-orange-900/20 border-orange-500/30",
        },
      ]
    : [
        {
          title: "Orders",
          description: "Manage all orders",
          icon: <ShoppingBag className="w-8 h-8 text-purple-400" />,
          action: () => navigate("/orders"),
          color: "bg-purple-900/20 border-purple-500/30",
        },
        {
          title: "Collections",
          description: "Manage collections",
          icon: <Package className="w-8 h-8 text-blue-400" />,
          action: () => navigate("/collections"),
          color: "bg-blue-900/20 border-blue-500/30",
        },
        {
          title: "Retailers",
          description: "Manage retailers",
          icon: <Users className="w-8 h-8 text-green-400" />,
          action: () => navigate("/users"),
          color: "bg-green-900/20 border-green-500/30",
        },
        {
          title: "Analytics",
          description: "View business insights",
          icon: <TrendingUp className="w-8 h-8 text-orange-400" />,
          action: () => {},
          color: "bg-orange-900/20 border-orange-500/30",
        },
      ];

  if (stats.loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
          <div className="p-4">
            <Title level={3} className="!text-white !mb-2">
              {isRetailer ? "Exclusive Summer Sale" : `Welcome, ${user?.name}`}
            </Title>
            <Text className="text-purple-100">
              {isRetailer
                ? "Up to 50% off on selected items!"
                : "Manage your business efficiently"}
            </Text>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          {isWholesaler ? (
            <>
              <Col xs={12} sm={6}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary">Total Orders</span>
                    }
                    value={stats.totalOrders}
                    valueStyle={{ color: "#8B5CF6" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary">Pending</span>
                    }
                    value={stats.pendingOrders}
                    valueStyle={{ color: "#F59E0B" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary">Retailers</span>
                    }
                    value={stats.totalRetailers}
                    valueStyle={{ color: "#10B981" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary">Collections</span>
                    }
                    value={stats.totalCollections}
                    valueStyle={{ color: "#3B82F6" }}
                  />
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Col xs={8}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary text-xs">
                        Orders in Progress
                      </span>
                    }
                    value={stats.pendingOrders}
                    valueStyle={{ color: "#8B5CF6", fontSize: "24px" }}
                  />
                </Card>
              </Col>
              <Col xs={8}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary text-xs">
                        Latest Collection
                      </span>
                    }
                    value={stats.totalCollections}
                    valueStyle={{ color: "#10B981", fontSize: "24px" }}
                  />
                </Card>
              </Col>
              <Col xs={8}>
                <Card className="theme-card text-center">
                  <Statistic
                    title={
                      <span className="theme-text-secondary text-xs">
                        Exclusive Offers
                      </span>
                    }
                    value="20%"
                    valueStyle={{ color: "#F59E0B", fontSize: "24px" }}
                  />
                </Card>
              </Col>
            </>
          )}
        </Row>

        {/* Quick Actions */}
        <div>
          <Title level={4} className="!theme-text-primary !mb-4">
            Quick Actions
          </Title>
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => (
              <Col xs={12} sm={12} md={8} lg={6} key={index}>
                <Card
                  hoverable
                  onClick={action.action}
                  className={`theme-card-hover ${action.color} cursor-pointer transition-all duration-300 hover:scale-105`}
                >
                  <div className="text-center p-4">
                    <div className="mb-3 flex justify-center">
                      {action.icon}
                    </div>
                    <Title level={5} className="!theme-text-primary !mb-1">
                      {action.title}
                    </Title>
                    <Text className="theme-text-secondary text-sm">
                      {action.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Chart for Wholesalers */}
        {isWholesaler && (
          <Card className="theme-card">
            <Title level={4} className="!theme-text-primary !mb-4">
              Monthly Orders Overview
            </Title>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-secondary)"
                  />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Bar dataKey="orders" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
