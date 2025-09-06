import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService } from "../../services";

const { Title, Text } = Typography;

export const SetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get mobile number from location state
  const mobileNo = location.state?.mobileNo || "";

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.setPassword({
        mobile_no: mobileNo,
        password: values.password,
      });

      message.success(
        "Password set successfully! Please login with your credentials."
      );
      navigate("/login");
    } catch (error) {
      console.error("Failed to set password:", error);
      message.error("Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <Title level={2} className="!text-white !mb-2">
              Set Your Password
            </Title>
            <Text className="text-gray-400">
              Set a password for your account
            </Text>
            {mobileNo && (
              <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                <Text className="text-gray-300 text-sm">
                  <User className="w-4 h-4 inline mr-1" />
                  {mobileNo}
                </Text>
              </div>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label={<span className="text-gray-300">New Password</span>}
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 4, message: "Password must be at least 4 characters" },
              ]}
            >
              <Input.Password
                placeholder="Enter your new password"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Confirm Password</span>}
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password" },
                { min: 4, message: "Password must be at least 4 characters" },
              ]}
            >
              <Input.Password
                placeholder="Confirm your new password"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Set Password
              </Button>
            </Form.Item>

            <div className="text-center">
              <Button
                type="link"
                onClick={handleBackToLogin}
                className="!text-gray-400 hover:!text-white flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};
