import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { User, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title } = Typography;

interface ProfileFormData {
  name: string;
  mobile_no: string;
  shop_name: string;
}

export const EditProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: ProfileFormData) => {
    if (!user) {
      message.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const updatedUserResponse = await userService.updateProfile(
        user.id,
        values
      );
      message.success("Profile updated successfully!");

      // Convert UserResponse to AuthUser format
      const updatedAuthUser = {
        ...updatedUserResponse,
        hashed_password: user.hashed_password, // Keep the existing hashed password
      };

      // Update the user data in the context
      updateUser(updatedAuthUser);

      navigate("/profile");
    } catch (error) {
      console.error("Update profile error:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Edit Profile" showBack={true}>
      <Card className="bg-gray-800 border-gray-700">
        <Title level={4} className="!text-white !mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Edit Profile Information
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: user?.name,
            mobile_no: user?.mobile_no,
            shop_name: user?.shop_name,
          }}
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<Save className="w-4 h-4" />}
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
};
