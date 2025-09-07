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
import { TelephoneField } from "../Common/TelephoneField";
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
  const [oldPassword, setOldPassword] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState(["", "", "", ""]);
  const [confirmPassword, setConfirmPassword] = useState(["", "", "", ""]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);

    // Remove 91 prefix from mobile number for editing (show only 10 digits)
    const mobileWithoutPrefix = user?.mobile_no?.startsWith("91")
      ? user.mobile_no.substring(2)
      : user?.mobile_no;

    editForm.setFieldsValue({
      name: user?.name,
      mobile_no: mobileWithoutPrefix,
      shop_name: user?.shop_name,
    });
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
    setOldPassword(["", "", "", ""]);
    setNewPassword(["", "", "", ""]);
    setConfirmPassword(["", "", "", ""]);
    changePasswordForm.resetFields();
  };

  const handlePasswordChange = (
    index: number,
    value: string,
    type: "oldPassword" | "newPassword" | "confirmPassword"
  ) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      if (type === "oldPassword") {
        const newOldPassword = [...oldPassword];
        newOldPassword[index] = value;
        setOldPassword(newOldPassword);

        // Auto-focus next input
        if (value && index < 3) {
          const nextInput = document.getElementById(
            `old-password-${index + 1}`
          );
          nextInput?.focus();
        }
      } else if (type === "newPassword") {
        const newNewPassword = [...newPassword];
        newNewPassword[index] = value;
        setNewPassword(newNewPassword);

        // Auto-focus next input
        if (value && index < 3) {
          const nextInput = document.getElementById(
            `new-password-${index + 1}`
          );
          nextInput?.focus();
        }
      } else {
        const newConfirmPassword = [...confirmPassword];
        newConfirmPassword[index] = value;
        setConfirmPassword(newConfirmPassword);

        // Auto-focus next input
        if (value && index < 3) {
          const nextInput = document.getElementById(
            `confirm-password-${index + 1}`
          );
          nextInput?.focus();
        }
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    type: "oldPassword" | "newPassword" | "confirmPassword"
  ) => {
    if (
      e.key === "Backspace" &&
      !(type === "oldPassword"
        ? oldPassword[index]
        : type === "newPassword"
        ? newPassword[index]
        : confirmPassword[index]) &&
      index > 0
    ) {
      const prevInput = document.getElementById(
        `${
          type === "oldPassword"
            ? "old-password"
            : type === "newPassword"
            ? "new-password"
            : "confirm-password"
        }-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      // Add 91 prefix to mobile number
      const mobileWithPrefix = `91${values.mobile_no}`;

      const updatedUserData = await userService.updateProfile(user.id, {
        name: values.name,
        mobile_no: mobileWithPrefix,
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

  const handleChangePasswordSubmit = async () => {
    const fullOldPassword = oldPassword.join("");
    const fullNewPassword = newPassword.join("");
    const fullConfirmPassword = confirmPassword.join("");

    if (fullOldPassword.length !== 4) {
      message.error("Please enter 4-digit old password");
      return;
    }

    if (fullNewPassword.length !== 4) {
      message.error("Please enter 4-digit new password");
      return;
    }

    if (fullConfirmPassword.length !== 4) {
      message.error("Please enter 4-digit confirm password");
      return;
    }

    if (fullNewPassword !== fullConfirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        oldPassword: fullOldPassword,
        newPassword: fullNewPassword,
      });

      message.success("Password changed successfully!");
      setChangePasswordModalVisible(false);
      setOldPassword(["", "", "", ""]);
      setNewPassword(["", "", "", ""]);
      setConfirmPassword(["", "", "", ""]);
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
            <Card className="theme-card h-fit">
              <div className="text-center space-y-4">
                <Avatar
                  size={80}
                  className="bg-purple-600 mx-auto"
                  icon={<User className="w-8 h-8" />}
                />
                <div>
                  <Title level={3} className="!theme-text-primary !mb-1">
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
            <Card className="theme-card">
              <Title level={4} className="!theme-text-primary !mb-4">
                Personal Information
              </Title>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <div>
                    <Text className="theme-text-secondary">Mobile Number</Text>
                    <br />
                    <Text className="theme-text-primary font-medium">
                      +{user.mobile_no}
                    </Text>
                  </div>
                </div>

                <Divider className="theme-border-secondary" />

                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-blue-400" />
                  <div>
                    <Text className="theme-text-secondary">Shop Name</Text>
                    <br />
                    <Text className="theme-text-primary font-medium">
                      {user.shop_name}
                    </Text>
                  </div>
                </div>

                <Divider className="theme-border-secondary" />

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <Text className="theme-text-secondary">Member Since</Text>
                    <br />
                    <Text className="theme-text-primary font-medium">
                      {moment(user.created_at).format("MMMM DD, YYYY")}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="theme-card">
              <Title level={4} className="!theme-text-primary !mb-4">
                Settings
              </Title>

              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  size="large"
                  icon={<Edit className="w-5 h-5" />}
                  onClick={handleEditProfile}
                  className="w-full theme-button flex items-center"
                >
                  Edit Profile
                </Button>

                <Button
                  size="large"
                  icon={<Settings className="w-5 h-5" />}
                  onClick={handleChangePassword}
                  className="w-full theme-button flex items-center"
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
            <span className="theme-text-primary">Edit Profile</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
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
            label={<span className="theme-text-secondary">Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Enter your name"
              className="theme-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="theme-text-secondary">Mobile Number</span>}
            name="mobile_no"
            rules={[
              { required: true, message: "Please enter mobile number" },
              {
                pattern: /^\d{10}$/,
                message: "Please enter valid 10-digit mobile number",
              },
            ]}
          >
            <TelephoneField
              placeholder="Enter mobile number"
              size="large"
              maxLength={10}
              className="h-11 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-lg"
              disabled
            />
          </Form.Item>

          <Form.Item
            label={<span className="theme-text-secondary">Shop Name</span>}
            name="shop_name"
            rules={[{ required: true, message: "Please enter shop name" }]}
          >
            <Input
              placeholder="Enter shop name"
              className="theme-input"
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
                className="theme-button"
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
            <span className="theme-text-primary">Change Password</span>
          </div>
        }
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
          setOldPassword(["", "", "", ""]);
          setNewPassword(["", "", "", ""]);
          setConfirmPassword(["", "", "", ""]);
          changePasswordForm.resetFields();
        }}
        footer={null}
        width={350}
        centered
        className="change-password-modal"
      >
        <div className="space-y-6">
          {/* Hidden fake fields to trick browsers */}
          <div style={{ display: "none" }}>
            <input type="text" name="fake_username" autoComplete="username" />
            <input
              type="password"
              name="fake_password"
              autoComplete="current-password"
            />
          </div>

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-3">
              Old Password
            </label>
            <div className="flex items-center justify-center gap-4">
              {oldPassword.map((digit, index) => (
                <Input
                  key={index}
                  id={`old-password-${index}`}
                  type="password"
                  value={digit}
                  onChange={(e) =>
                    handlePasswordChange(index, e.target.value, "oldPassword")
                  }
                  onKeyDown={(e) => handleKeyDown(index, e, "oldPassword")}
                  className="w-14 h-14 text-center text-xl font-semibold theme-input rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-3">
              New Password
            </label>
            <div className="flex items-center justify-center gap-4">
              {newPassword.map((digit, index) => (
                <Input
                  key={index}
                  id={`new-password-${index}`}
                  type="password"
                  value={digit}
                  onChange={(e) =>
                    handlePasswordChange(index, e.target.value, "newPassword")
                  }
                  onKeyDown={(e) => handleKeyDown(index, e, "newPassword")}
                  className="w-14 h-14 text-center text-xl font-semibold theme-input rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-3">
              Confirm New Password
            </label>
            <div className="flex items-center justify-center gap-4">
              {confirmPassword.map((digit, index) => (
                <Input
                  key={index}
                  id={`confirm-password-${index}`}
                  type="password"
                  value={digit}
                  onChange={(e) =>
                    handlePasswordChange(
                      index,
                      e.target.value,
                      "confirmPassword"
                    )
                  }
                  onKeyDown={(e) => handleKeyDown(index, e, "confirmPassword")}
                  className="w-14 h-14 text-center text-xl font-semibold theme-input rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => {
                setChangePasswordModalVisible(false);
                setOldPassword(["", "", "", ""]);
                setNewPassword(["", "", "", ""]);
                setConfirmPassword(["", "", "", ""]);
                changePasswordForm.resetFields();
              }}
              size="large"
              className="theme-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleChangePasswordSubmit}
              loading={loading}
              size="large"
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
