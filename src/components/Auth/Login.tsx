import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPassword = [...password];
      newPassword[index] = value;
      setPassword(newPassword);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`password-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !password[index] && index > 0) {
      const prevInput = document.getElementById(`password-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (values: { mobile_no: string }) => {
    const fullPassword = password.join("");
    if (fullPassword.length !== 4) {
      message.error("Please enter 4-digit password");
      return;
    }

    setLoading(true);
    try {
      console.log(
        "Login component: Attempting login with:",
        values.mobile_no,
        "password length:",
        fullPassword.length
      );
      const success = await login(values.mobile_no, fullPassword);
      console.log("Login component: Login result:", success);
      if (success) {
        message.success("Login successful!");
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        message.error("Invalid mobile number or password");
      }
    } catch (error) {
      console.error("Login component: Login error:", error);
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <Text className="text-gray-400">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <Title level={2} className="!text-white !mb-2 !font-bold">
              Welcome Back
            </Title>
            <Text className="text-gray-400 text-base">
              Sign in to your account
            </Text>
          </div>

          <Form onFinish={handleSubmit} layout="vertical">
            {/* Hidden fake fields to trick browsers */}
            <div style={{ display: "none" }}>
              <input type="text" name="fake_username" autoComplete="username" />
              <input
                type="password"
                name="fake_password"
                autoComplete="current-password"
              />
              <input type="tel" name="fake_mobile" autoComplete="tel" />
            </div>

            <Form.Item
              label={
                <span className="text-gray-300 font-medium">Mobile Number</span>
              }
              name="mobile_no"
              rules={[
                { required: true, message: "Please enter your mobile number" },
                {
                  pattern: /^\d{10}$/,
                  message: "Please enter valid 10-digit mobile number",
                },
              ]}
              className="mb-6"
            >
              <Input
                placeholder="Enter mobile number"
                className="bg-gray-700 border-gray-600 text-white h-12 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                size="large"
                autoComplete="off"
                name="mobile_number"
                type="tel"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-gray-300 font-medium">
                  4-Digit Password
                </span>
              }
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3">
                {password.map((digit, index) => (
                  <Input
                    key={index}
                    id={`password-${index}`}
                    type={showPassword ? "text" : "password"}
                    value={digit}
                    onChange={(e) =>
                      handlePasswordChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg bg-gray-700 border-gray-600 text-white rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    maxLength={1}
                    placeholder="•"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-300 transition-colors p-2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 border-purple-600 rounded-md font-medium text-base"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};
