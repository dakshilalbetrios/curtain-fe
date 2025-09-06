import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Avatar,
  Tag,
  Divider,
  Space,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  User,
  Phone,
  Store,
  Calendar,
  Settings,
  LogOut,
  Edit,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../Layout/MainLayout";
import { userService } from "../../services";
import moment from "moment";

const { Title, Text } = Typography;

export const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [editForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: user?.name,
      mobile_no: user?.mobile_no,
      shop_name: user?.shop_name,
    });
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
    changePasswordForm.resetFields();
  };

  const handleEditSubmit = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUserData = await userService.updateProfile(user.id, {
        name: values.name,
        mobile_no: values.mobile_no,
        shop_name: values.shop_name,
        role: user.role,
        status: user.status,
      });

      // Update the user context with the actual API response data
      const updatedUser = {
        ...user,
        name: updatedUserData.name,
        mobile_no: updatedUserData.mobile_no,
        shop_name: updatedUserData.shop_name,
        updated_at: updatedUserData.updated_at,
      };
      updateUser(updatedUser);

      message.success("Profile updated successfully!");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Password changed successfully!");
      setChangePasswordModalVisible(false);
      changePasswordForm.resetFields();
    } catch (error) {
      console.error("Failed to change password:", error);
      message.error(
        "Failed to change password. Please check your old password."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "purple";
      case "SALES":
        return "blue";
      case "CUSTOMER":
        return "green";
      default:
        return "gray";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "SALES":
        return "Sales Manager";
      case "CUSTOMER":
        return "Retailer";
      default:
        return role;
    }
  };

  if (!user) return null;

  return (
    <MainLayout title="Profile">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Header - Full width on mobile, 1 column on desktop */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 h-fit">
              <div className="text-center space-y-4">
                <Avatar
                  size={80}
                  className="bg-purple-600 mx-auto"
                  icon={<User className="w-8 h-8" />}
                />
                <div>
                  <Title level={3} className="!text-white !mb-1">
                    {user.name}
                  </Title>
                  <Tag color={getRoleColor(user.role)} className="mb-2">
                    {getRoleName(user.role)}
                  </Tag>
                  <br />
                  <Tag color={user.status === "ACTIVE" ? "green" : "red"}>
                    {user.status}
                  </Tag>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Details and Actions - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details */}
            <Card className="bg-gray-800 border-gray-700">
              <Title level={4} className="!text-white !mb-4">
                Personal Information
              </Title>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <div>
                    <Text className="text-gray-300">Mobile Number</Text>
                    <br />
                    <Text className="text-white font-medium">
                      {user.mobile_no}
                    </Text>
                  </div>
                </div>

                <Divider className="border-gray-600" />

                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-blue-400" />
                  <div>
                    <Text className="text-gray-300">Shop Name</Text>
                    <br />
                    <Text className="text-white font-medium">
                      {user.shop_name}
                    </Text>
                  </div>
                </div>

                <Divider className="border-gray-600" />

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <Text className="text-gray-300">Member Since</Text>
                    <br />
                    <Text className="text-white font-medium">
                      {moment(user.created_at).format("MMMM DD, YYYY")}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <Title level={4} className="!text-white !mb-4">
                Settings
              </Title>

              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  size="large"
                  icon={<Edit className="w-5 h-5" />}
                  onClick={handleEditProfile}
                  className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center"
                >
                  Edit Profile
                </Button>

                <Button
                  size="large"
                  icon={<Settings className="w-5 h-5" />}
                  onClick={handleChangePassword}
                  className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center"
                >
                  Change Password
                </Button>

                <Button
                  size="large"
                  danger
                  icon={<LogOut className="w-5 h-5" />}
                  onClick={handleLogout}
                  className="w-full flex items-center"
                >
                  Logout
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Edit className="w-5 h-5 mr-2 text-purple-400" />
            <span className="text-white">Edit Profile</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
        centered
        className="edit-profile-modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          autoComplete="off"
        >
          <Form.Item
            label={<span className="text-gray-300">Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Enter your name"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300">Mobile Number</span>}
            name="mobile_no"
            rules={[
              { required: true, message: "Please enter mobile number" },
              {
                pattern: /^\d{10}$/,
                message: "Please enter valid 10-digit mobile number",
              },
            ]}
          >
            <Input
              placeholder="Enter mobile number"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
              type="tel"
              disabled
              title="Mobile number cannot be changed"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300">Shop Name</span>}
            name="shop_name"
            rules={[{ required: true, message: "Please enter shop name" }]}
          >
            <Input
              placeholder="Enter shop name"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                }}
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Update Profile
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Lock className="w-5 h-5 mr-2 text-purple-400" />
            <span className="text-white">Change Password</span>
          </div>
        }
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
          changePasswordForm.resetFields();
        }}
        footer={null}
        width={600}
        centered
        className="change-password-modal"
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePasswordSubmit}
          autoComplete="off"
        >
          <Form.Item
            label={<span className="text-gray-300">Old Password</span>}
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input.Password
              placeholder="Enter your old password"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300">New Password</span>}
            name="newPassword"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 4, message: "Password must be at least 4 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter your new password"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300">Confirm New Password</span>}
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm your new password" },
              { min: 4, message: "Password must be at least 4 characters" },
            ]}
          >
            <Input.Password
              placeholder="Confirm your new password"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setChangePasswordModalVisible(false);
                  changePasswordForm.resetFields();
                }}
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};
