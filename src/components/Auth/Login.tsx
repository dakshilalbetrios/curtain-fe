import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { User, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services";
import { TelephoneField } from "../Common/TelephoneField";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const [mobileNo, setMobileNo] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
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

  const checkUserExists = async (mobileNumber: string) => {
    if (mobileNumber.length !== 10) return;

    try {
      // Add +91 prefix for API call
      const mobileWithPrefix = `91${mobileNumber}`;
      const response = await userService.checkUserExists(mobileWithPrefix);

      if (response.error === false && response.data) {
        setUserExists(true);
        setUserData(response.data);

        if (response.data.hashed_password) {
          // User has password, show password field
          setShowPasswordField(true);
          message.success("User found! Please enter your password.");
        } else {
          // User doesn't have password, redirect to set password
          message.info("Please set your password to continue.");
          navigate("/set-password", { state: { mobileNo: mobileWithPrefix } });
        }
      } else {
        setUserExists(false);
        setShowPasswordField(false);
        message.error("Please inform admin to create your user account.");
      }
    } catch (error) {
      console.error("Failed to check user existence:", error);
      message.error("Failed to verify user. Please try again.");
      setUserExists(null);
      setShowPasswordField(false);
    }
  };

  const handleMobileChange = (value?: string) => {
    const cleanValue = value || "";
    setMobileNo(cleanValue);

    // Reset states when mobile number changes
    setUserExists(null);
    setUserData(null);
    setShowPasswordField(false);
    setPassword(["", "", "", ""]);

    // Check user existence when 10 digits are entered
    if (cleanValue.length === 10) {
      checkUserExists(cleanValue);
    }
  };

  const handleSubmit = async () => {
    if (!userExists || !showPasswordField) {
      message.error("Please enter a valid mobile number first");
      return;
    }

    const fullPassword = password.join("");
    if (fullPassword.length !== 4) {
      message.error("Please enter 4-digit password");
      return;
    }

    setLoading(true);
    try {
      // Add +91 prefix for login
      const mobileWithPrefix = `91${mobileNo}`;
      const success = await login(mobileWithPrefix, fullPassword);

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
      <div className="min-h-screen theme-bg-primary flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <Text className="theme-text-secondary">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary flex items-center justify-center">
      <Card className="w-full max-w-[25rem] theme-card theme-shadow-lg">
        <div className="px-[2rem] py-10">
          <div className="text-center mb-10">
            <Title level={2} className="!theme-text-primary !mb-3 !font-bold">
              Welcome Back
            </Title>
            <Text className="theme-text-secondary text-lg">
              Sign in to your account
            </Text>
          </div>

          <Form layout="vertical">
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
                <span className="theme-text-secondary font-medium text-base">
                  Mobile Number
                </span>
              }
              className="mb-8"
            >
              <TelephoneField
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={handleMobileChange}
                size="large"
                maxLength={10}
                className="h-11 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-lg"
              />

              {/* User status messages */}
              {userExists === true && userData && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-400" />
                    <Text className="text-green-400 text-sm">
                      Welcome, {userData.name}!
                    </Text>
                  </div>
                </div>
              )}

              {userExists === false && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <Text className="text-red-400 text-sm">
                      Please inform admin to create your user account
                    </Text>
                  </div>
                </div>
              )}
            </Form.Item>

            {showPasswordField && (
              <Form.Item
                label={
                  <span className="theme-text-secondary font-medium">
                    Password
                  </span>
                }
                className="mb-8"
              >
                <div className="flex items-center justify-center gap-4">
                  {password.map((digit, index) => (
                    <Input
                      key={index}
                      id={`password-${index}`}
                      type="password"
                      value={digit}
                      onChange={(e) =>
                        handlePasswordChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-xl font-semibold theme-input rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      maxLength={1}
                      placeholder="•"
                    />
                  ))}
                </div>
              </Form.Item>
            )}

            <Form.Item className="mb-0">
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!showPasswordField}
                size="large"
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 border-purple-600 rounded-lg font-semibold text-lg disabled:bg-gray-600 disabled:border-gray-600 transition-all duration-200"
              >
                {showPasswordField ? "Sign In" : "Enter Mobile Number"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};
