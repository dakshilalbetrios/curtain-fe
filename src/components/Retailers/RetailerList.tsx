import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Input,
  Space,
  Avatar,
  Switch,
  Spin,
  message,
} from "antd";
import { Users, Search, Plus, Phone, Store, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersAPI, User } from "../../services/api";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const RetailerList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      if (!response.error) {
        setUsers(response.data);
        setError(null);
      } else {
        const errorMessage = response.message || "Failed to fetch users";
        setError(errorMessage);
        console.error("Failed to fetch users:", response.message);
        message.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = "Failed to fetch users";
      setError(errorMessage);
      console.error("Error fetching users:", error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const retailers = users.filter((user) => user.role === "CUSTOMER");
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

  const handleStatusToggle = async (retailerId: number, checked: boolean) => {
    try {
      console.log(
        `Toggle retailer ${retailerId} status to ${
          checked ? "ACTIVE" : "INACTIVE"
        }`
      );
      // TODO: Add API call to update user status
      // const response = await usersAPI.updateStatus(retailerId, checked ? 'ACTIVE' : 'INACTIVE');
      // if (!response.error) {
      //   message.success('Status updated successfully');
      //   fetchUsers(); // Refresh the list
      // }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Retailers">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Retailers">
        <div className="text-center py-8">
          <Title level={4} className="!text-red-400 !mb-4">
            Error Loading Retailers
          </Title>
          <Text className="text-gray-400 mb-4">{error}</Text>
          <Button
            type="primary"
            onClick={fetchUsers}
            className="bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retailers">
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={4} className="!text-white !mb-1">
              Retailers ({retailers.length})
            </Title>
            <Text className="text-gray-400">
              Manage your retailer accounts and their access
            </Text>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <AntSearch
            placeholder="Search retailers..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
            size="large"
            prefix={<Search className="w-4 h-4 text-gray-400" />}
          />
          <div className="flex gap-2">
            <Button
              icon={<Users className="w-4 h-4" />}
              onClick={fetchUsers}
              size="large"
              className="bg-gray-600 hover:bg-gray-700 border-gray-600"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddRetailer}
              size="large"
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Add Retailer
            </Button>
          </div>
        </div>

        {/* Retailers Grid */}
        {filteredRetailers.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 text-center py-8">
            <Title level={4} className="!text-gray-400">
              {searchText
                ? "No retailers found matching your search"
                : "No retailers available"}
            </Title>
            <Text className="text-gray-500">
              {searchText
                ? "Try adjusting your search criteria"
                : "Start by adding your first retailer"}
            </Text>
            {!searchText && (
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddRetailer}
                className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Add First Retailer
              </Button>
            )}
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredRetailers.map((retailer) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={retailer.id}>
                <Card
                  hoverable
                  onClick={() => handleRetailerClick(retailer.id)}
                  className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        size="large"
                        className="bg-purple-600"
                        icon={<UserCheck className="w-6 h-6" />}
                      />
                      <div className="flex-1">
                        <Title level={5} className="!text-white !mb-0">
                          {retailer.name}
                        </Title>
                        <div className="flex items-center space-x-2 mt-1">
                          <Tag
                            color={
                              retailer.status === "ACTIVE" ? "green" : "red"
                            }
                          >
                            {retailer.status}
                          </Tag>
                          <Switch
                            size="small"
                            checked={retailer.status === "ACTIVE"}
                            onChange={(checked) =>
                              handleStatusToggle(retailer.id, checked)
                            }
                            onClick={(checked, e) => e?.stopPropagation()}
                          />
                        </div>
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
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </MainLayout>
  );
};
