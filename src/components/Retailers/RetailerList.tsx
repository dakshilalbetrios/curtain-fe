import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Input,
  Avatar,
  Skeleton,
  Modal,
  message,
} from "antd";
import {
  Users,
  Search,
  Plus,
  Phone,
  Store,
  UserCheck,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService, UserResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const RetailerList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const retailers = users.filter(
    (user) => user.role === "CUSTOMER" || user.role === "SALES"
  );
  const filteredRetailers = retailers.filter(
    (retailer) =>
      retailer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      retailer.shop_name.toLowerCase().includes(searchText.toLowerCase()) ||
      retailer.mobile_no.includes(searchText)
  );

  const handleAddRetailer = () => {
    navigate("/retailers/add");
  };

  const handleRetailerClick = (retailerId: number) => {
    navigate(`/retailers/${retailerId}`);
  };

  const handleEditRetailer = (retailerId: number) => {
    navigate(`/retailers/edit/${retailerId}`);
  };

  const handleDeleteRetailer = (retailerId: number, retailerName: string) => {
    Modal.confirm({
      title: "Delete Retailer",
      content: `Are you sure you want to delete "${retailerName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await userService.deleteUser(retailerId);
          message.success(`Retailer "${retailerName}" deleted successfully!`);

          // Refresh the retailers list
          const updatedUsers = await userService.getAllUsers();
          setUsers(updatedUsers);
        } catch (error) {
          console.error("Delete error:", error);
          message.error(
            `Failed to delete retailer "${retailerName}". Please try again.`
          );
        }
      },
    });
  };

  // Skeleton loading component
  const RetailerSkeleton = () => (
    <Col xs={24} sm={12} lg={8} xl={6} className="mb-4">
      <Card className="bg-gray-800 border-gray-700 h-64">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="Retailers">
      <div className="space-y-2">
        {/* Search and Add Button - Fixed Position */}
        <div className="sticky top-0 z-10 bg-gray-900/95 pt-4 -mx-4 px-4 backdrop-blur-sm border-b border-gray-700/50 pb-4 mb-4">
          <div className="flex gap-4 items-center">
            <AntSearch
              placeholder="Search retailers..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
              size="large"
              prefix={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddRetailer}
              size="large"
              className="bg-purple-600 hover:bg-purple-700 border-purple-600 whitespace-nowrap"
            >
              Add User
            </Button>
          </div>
        </div>

        {/* Retailers Grid */}
        {loading ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <RetailerSkeleton key={index} />
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredRetailers.length === 0 ? (
              <Col span={24}>
                <Card className="bg-gray-800 border-gray-700 text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <Title level={4} className="!text-gray-400 !mb-2">
                    No Retailers Found
                  </Title>
                  <Text className="text-gray-500">
                    {searchText
                      ? "Try adjusting your search terms"
                      : "No retailers available at the moment"}
                  </Text>
                </Card>
              </Col>
            ) : (
              filteredRetailers.map((retailer) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={retailer.id}>
                  <Card
                    hoverable
                    // onClick={() => handleRetailerClick(retailer.id)}
                    className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Avatar
                            size="large"
                            className="bg-purple-600"
                            icon={<UserCheck className="w-6 h-6" />}
                          />
                          <Title level={5} className="!text-white !mb-0">
                            {retailer.name}
                          </Title>
                        </div>
                        <div className="flex items-center mt-1">
                          <Tag
                            color={
                              retailer.status === "ACTIVE" ? "green" : "red"
                            }
                          >
                            {retailer.status}
                          </Tag>
                          <Tag
                            color={retailer.role === "ADMIN" ? "green" : "red"}
                          >
                            {retailer.role.charAt(0) +
                              retailer.role.slice(1).toLowerCase()}
                          </Tag>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Store className="w-4 h-4" />
                          <Text className="text-gray-400 text-sm">
                            {retailer.shop_name}
                          </Text>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Phone className="w-4 h-4" />
                          <Text className="text-gray-400 text-sm">
                            {retailer.mobile_no}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 justify-between">
                        <Button
                          type="link"
                          className="!text-purple-400 hover:!text-purple-300 !p-0 !h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetailerClick(retailer.id);
                          }}
                        >
                          Manage Collections →
                        </Button>

                        <div className="flex items-center space-x-3">
                          <Button
                            type="link"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRetailer(retailer.id);
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
                              handleDeleteRetailer(retailer.id, retailer.name);
                            }}
                            className="!text-red-400 hover:!text-red-300 !p-0 !h-auto flex items-center gap-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </div>
    </MainLayout>
  );
};
