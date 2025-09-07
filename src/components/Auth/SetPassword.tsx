import React, { useState } from "react";
import { Input, Button, Card, Typography, message } from "antd";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService } from "../../services";

const { Title, Text } = Typography;

export const SetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(["", "", "", ""]);
  const [confirmPassword, setConfirmPassword] = useState(["", "", "", ""]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get mobile number from location state
  const mobileNo = location.state?.mobileNo || "";

  const handlePasswordChange = (
    index: number,
    value: string,
    type: "password" | "confirmPassword"
  ) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      if (type === "password") {
        const newPassword = [...password];
        newPassword[index] = value;
        setPassword(newPassword);

        // Auto-focus next input
        if (value && index < 3) {
          const nextInput = document.getElementById(`password-${index + 1}`);
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
    type: "password" | "confirmPassword"
  ) => {
    if (
      e.key === "Backspace" &&
      !(type === "password" ? password[index] : confirmPassword[index]) &&
      index > 0
    ) {
      const prevInput = document.getElementById(
        `${type === "password" ? "password" : "confirm-password"}-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullPassword = password.join("");
    const fullConfirmPassword = confirmPassword.join("");

    if (fullPassword.length !== 4) {
      message.error("Please enter 4-digit password");
      return;
    }

    if (fullConfirmPassword.length !== 4) {
      message.error("Please enter 4-digit confirm password");
      return;
    }

    if (fullPassword !== fullConfirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.setPassword({
        mobile_no: mobileNo,
        password: fullPassword,
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
    <div className="min-h-screen theme-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card className="theme-card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <Title level={2} className="!theme-text-primary !mb-2">
              Set Your Password
            </Title>
            <Text className="theme-text-secondary">
              Set a password for your account
            </Text>
            {mobileNo && (
              <div className="mt-2 p-2 theme-bg-tertiary rounded-lg">
                <Text className="theme-text-secondary text-sm">
                  <User className="w-4 h-4 inline mr-1" />+{mobileNo}
                </Text>
              </div>
            )}
          </div>

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

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                New Password
              </label>
              <div className="flex items-center justify-center gap-4">
                {password.map((digit, index) => (
                  <Input
                    key={index}
                    id={`password-${index}`}
                    type="password"
                    value={digit}
                    onChange={(e) =>
                      handlePasswordChange(index, e.target.value, "password")
                    }
                    onKeyDown={(e) => handleKeyDown(index, e, "password")}
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
                Confirm Password
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
                    onKeyDown={(e) =>
                      handleKeyDown(index, e, "confirmPassword")
                    }
                    className="w-14 h-14 text-center text-xl font-semibold theme-input rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    maxLength={1}
                    placeholder="•"
                  />
                ))}
              </div>
            </div>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              size="large"
              className="w-full h-14 bg-purple-600 hover:bg-purple-700 border-purple-600 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Set Password
            </Button>

            <div className="text-center">
              <Button
                type="link"
                onClick={handleBackToLogin}
                className="!theme-text-tertiary hover:!theme-text-primary flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
