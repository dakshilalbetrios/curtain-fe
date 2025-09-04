import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, message, Upload, Space, Divider } from 'antd';
import { UserPlus, Upload as UploadIcon, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../Layout/MainLayout';
import { mockUsers } from '../../data/mockData';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface RetailerFormData {
  name: string;
  mobile_no: string;
  password: string;
  shop_name: string;
  role: 'ADMIN' | 'SALES' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
}

export const AddRetailer: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEdit = !!id;
  const retailer = isEdit ? mockUsers.find(u => u.id === parseInt(id)) : null;

  useEffect(() => {
    if (isEdit && retailer) {
      form.setFieldsValue({
        name: retailer.name,
        mobile_no: retailer.mobile_no,
        shop_name: retailer.shop_name,
        role: retailer.role,
        status: retailer.status
      });
    }
  }, [isEdit, retailer, form]);

  const handleSubmit = async (values: RetailerFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Retailer ${isEdit ? 'updated' : 'added'} successfully!`);
      navigate('/retailers');
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'add'} retailer`);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    try {
      // Simulate CSV processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('CSV uploaded and processed successfully!');
      navigate('/retailers');
    } catch (error) {
      message.error('Failed to process CSV file');
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload
  };

  const downloadTemplate = () => {
    const csvContent = "name,mobile_no,password,shop_name,role,status\nJohn Doe,9876543210,1234,Sample Shop,CUSTOMER,ACTIVE";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retailer_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title={isEdit ? 'Edit Retailer' : 'Add Retailer'} showBack={true}>
      <div className="space-y-6">
        {/* Manual Form */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            {isEdit ? 'Edit Retailer' : 'Add New Retailer'}
          </Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: 'CUSTOMER', status: 'ACTIVE' }}
          >
            <Form.Item
              label={<span className="text-gray-300">Name</span>}
              name="name"
              rules={[{ required: true, message: 'Please enter retailer name' }]}
            >
              <Input
                placeholder="Enter retailer name"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Mobile Number</span>}
              name="mobile_no"
              rules={[
                { required: true, message: 'Please enter mobile number' },
                { pattern: /^\d{10}$/, message: 'Please enter valid 10-digit mobile number' }
              ]}
            >
              <Input
                placeholder="Enter mobile number"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Password</span>}
              name="password"
              rules={isEdit ? [] : [
                { required: true, message: 'Please enter password' },
                { min: 4, message: 'Password must be at least 4 characters' }
              ]}
            >
              <Input.Password
                placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Shop Name</span>}
              name="shop_name"
              rules={[{ required: true, message: 'Please enter shop name' }]}
            >
              <Input
                placeholder="Enter shop name"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Role</span>}
              name="role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select
                placeholder="Select role"
                className="bg-gray-700 border-gray-600"
                size="large"
              >
                <Option value="ADMIN">Administrator</Option>
                <Option value="SALES">Sales Manager</Option>
                <Option value="CUSTOMER">Retailer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Status</span>}
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                placeholder="Select status"
                className="bg-gray-700 border-gray-600"
                size="large"
              >
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Add Retailer
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* CSV Import - Only show for new retailers */}
        {!isEdit && (
          <Card className="bg-gray-800 border-gray-700">
            <Title level={4} className="!text-white !mb-4 flex items-center">
              <UploadIcon className="w-5 h-5 mr-2" />
              Bulk Import
            </Title>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-gray-300">
                  Upload CSV file to add multiple retailers at once
                </Text>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={downloadTemplate}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Download Template
                </Button>
              </div>

              <Dragger
                beforeUpload={handleCSVUpload}
                accept=".csv"
                showUploadList={false}
                className="bg-gray-700 border-gray-600 hover:border-purple-500"
              >
                <div className="p-6 text-center">
                  <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Text className="text-white text-lg block mb-2">
                    Click or drag CSV file to upload
                  </Text>
                  <Text className="text-gray-400">
                    Supports CSV files with retailer data
                  </Text>
                </div>
              </Dragger>

              {uploading && (
                <div className="text-center">
                  <Text className="text-purple-400">Processing CSV file...</Text>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};