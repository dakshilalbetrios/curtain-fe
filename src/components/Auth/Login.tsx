import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
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

    setCheckingUser(true);
    try {
      const response = await userService.checkUserExists(mobileNumber);

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
          navigate("/set-password", { state: { mobileNo: mobileNumber } });
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
    } finally {
      setCheckingUser(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setMobileNo(value);

    // Reset states when mobile number changes
    setUserExists(null);
    setUserData(null);
    setShowPasswordField(false);
    setPassword(["", "", "", ""]);

    // Check user existence when 10 digits are entered
    if (value.length === 10) {
      checkUserExists(value);
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
      console.log(
        "Login component: Attempting login with:",
        mobileNo,
        "password length:",
        fullPassword.length
      );
      const success = await login(mobileNo, fullPassword);
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
                <span className="text-gray-300 font-medium">Mobile Number</span>
              }
              className="mb-6"
            >
              <Input
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={handleMobileChange}
                className="bg-gray-700 border-gray-600 text-white h-12 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                size="large"
                autoComplete="off"
                name="mobile_number"
                type="tel"
                maxLength={10}
                suffix={
                  checkingUser ? (
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                  ) : null
                }
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
            )}

            <Form.Item className="mb-6">
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!showPasswordField}
                size="large"
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 border-purple-600 rounded-md font-medium text-base disabled:bg-gray-600 disabled:border-gray-600"
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
