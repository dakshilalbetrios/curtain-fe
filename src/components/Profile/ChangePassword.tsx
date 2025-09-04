import React, { useState } from 'react';
import { Form, Button, Card, Typography, message, Space } from 'antd';
import { Lock, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../Layout/MainLayout';

const { Title, Text } = Typography;

export const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState(['', '', '', '']);
  const navigate = useNavigate();

  const handlePasswordChange = (
    type: 'old' | 'new',
    index: number,
    value: string
  ) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      if (type === 'old') {
        const newOldPassword = [...oldPassword];
        newOldPassword[index] = value;
        setOldPassword(newOldPassword);
      } else {
        const newNewPassword = [...newPassword];
        newNewPassword[index] = value;
        setNewPassword(newNewPassword);
      }
      
      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`${type}-password-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    type: 'old' | 'new',
    index: number,
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Backspace') {
      const currentPassword = type === 'old' ? oldPassword : newPassword;
      if (!currentPassword[index] && index > 0) {
        const prevInput = document.getElementById(`${type}-password-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const oldPass = oldPassword.join('');
    const newPass = newPassword.join('');

    if (oldPass.length !== 4) {
      message.error('Please enter your current 4-digit password');
      return;
    }

    if (newPass.length !== 4) {
      message.error('Please enter a new 4-digit password');
      return;
    }

    if (oldPass === newPass) {
      message.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Password changed successfully!');
      navigate('/profile');
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Change Password" showBack={true}>
      <Card className="bg-gray-800 border-gray-700">
        <Title level={4} className="!text-white !mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Change Password
        </Title>
        
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <Text className="text-gray-300 block mb-3">Current Password</Text>
            <Space size="small">
              {oldPassword.map((digit, index) => (
                <input
                  key={index}
                  id={`old-password-${index}`}
                  type="password"
                  value={digit}
                  onChange={(e) => handlePasswordChange('old', index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown('old', index, e)}
                  className="w-12 h-12 text-center text-lg bg-gray-700 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </Space>
          </div>

          {/* New Password */}
          <div>
            <Text className="text-gray-300 block mb-3">New Password</Text>
            <Space size="small">
              {newPassword.map((digit, index) => (
                <input
                  key={index}
                  id={`new-password-${index}`}
                  type="password"
                  value={digit}
                  onChange={(e) => handlePasswordChange('new', index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown('new', index, e)}
                  className="w-12 h-12 text-center text-lg bg-gray-700 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  maxLength={1}
                  placeholder="•"
                />
              ))}
            </Space>
          </div>

          <Button
            type="primary"
            loading={loading}
            size="large"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Change Password
          </Button>
        </div>
      </Card>
    </MainLayout>
  );
};