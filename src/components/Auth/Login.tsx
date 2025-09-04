import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authAPI, LoginRequest } from "../../services/api";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const { login } = useAuth();
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
    // Prevent multiple submissions
    if (loading) {
      return;
    }

    const fullPassword = password.join("");
    if (fullPassword.length !== 4) {
      message.error("Please enter 4-digit password");
      return;
    }

    setLoading(true);
    try {
      const loginData: LoginRequest = {
        mobile_no: values.mobile_no,
        password: fullPassword,
      };

      const response = await authAPI.login(loginData);

      // Check if response exists and has the expected structure
      if (response && typeof response === "object") {
        // Check if login was successful
        if (!response.error && response.data && response.data.user) {
          // Validate user data structure
          const user = response.data.user;
          if (!user.id || !user.name || !user.mobile_no || !user.role) {
            message.error("Invalid user data received from server.");
            console.error("Invalid user data:", user);
            return;
          }
          try {
            // Attempt to login the user
            const loginSuccess = await login(response.data.user);

            if (loginSuccess) {
              // Authentication successful - cookies are automatically set by backend
              console.log("Login successful - cookies set by backend");

              message.success(response.message || "Login successful!");

              // Small delay to show success message before redirect
              setTimeout(() => {
                navigate("/dashboard");
              }, 500);
            } else {
              message.error("Login failed. Please try again.");
            }
          } catch (loginError) {
            console.error("Login context error:", loginError);
            message.error("Failed to authenticate user. Please try again.");
          }
        } else {
          // Handle API error response
          const errorMessage =
            response.message || "Invalid mobile number or password";
          message.error(errorMessage);

          // Log the error for debugging
          console.error("API Error Response:", response);
        }
      } else {
        // Handle unexpected response format
        message.error("Invalid response from server. Please try again.");
        console.error("Unexpected response format:", response);
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        message.error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        message.error("No response from server. Please check your connection.");
      } else {
        // Something else happened
        message.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <div className="text-center mb-8">
          <Title level={2} className="!text-white !mb-2">
            Welcome Back
          </Title>
          <Text className="text-gray-400">Sign in to your account</Text>
        </div>

        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label={<span className="text-gray-300">Mobile Number</span>}
            name="mobile_no"
            rules={[
              { required: true, message: "Please enter your mobile number" },
              {
                pattern: /^\d{10}$/,
                message: "Please enter valid 10-digit mobile number",
              },
              {
                validator: (_, value) => {
                  if (value && value.trim().length === 0) {
                    return Promise.reject(
                      new Error("Mobile number cannot be empty")
                    );
                  }
                  return Promise.resolve();
                },
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
            label={<span className="text-gray-300">4-Digit Password</span>}
          >
            <Space size="small">
              {password.map((digit, index) => (
                <Input
                  key={index}
                  id={`password-${index}`}
                  value={digit}
                  onChange={(e) => handlePasswordChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg bg-gray-700 border-gray-600 text-white"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </Space>
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="text-gray-400 text-sm">
              Demo credentials: Any mobile number with password: 1234
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};
