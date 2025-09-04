import React, { useState } from 'react';
import { Card, Typography, Tag, Button, Select, message, Modal, Form } from 'antd';
import { useParams } from 'react-router-dom';
import { Edit, Save, X } from 'lucide-react';
import { allOrders } from '../../data/mockData';
import { MainLayout } from '../Layout/MainLayout';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const orderId = parseInt(id || '0');
  const order = allOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <MainLayout title="Order Not Found" showBack={true}>
        <div className="text-center py-8">
          <Title level={3} className="!text-gray-400">Order Not Found</Title>
        </div>
      </MainLayout>
    );
  }

  const formatOrderId = (id: number) => {
    return `#${id.toString().padStart(6, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'SHIPPED': return 'blue';
      case 'DELIVERED': return 'purple';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const handleStatusUpdate = async (values: { status: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Order status updated successfully!');
      setIsModalVisible(false);
      // In real app, this would update the order data
    } catch (error) {
      message.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const showUpdateModal = () => {
    form.setFieldsValue({ status: order.status });
    setIsModalVisible(true);
  };

  return (
    <MainLayout title="Manage Order" showBack={true}>
      <div className="space-y-6">
        {/* Order Header */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={3} className="!text-white !mb-1">
                Order {formatOrderId(order.id)}
              </Title>
              <Text className="text-gray-400">
                Placed on {moment(order.created_at).format('MMM DD, YYYY')}
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <Tag 
                color={getStatusColor(order.status)}
                className="px-3 py-1 rounded-full text-sm font-medium"
              >
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </Tag>
              <Button
                type="primary"
                icon={<Edit className="w-4 h-4" />}
                onClick={showUpdateModal}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Update Status
              </Button>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <Title level={4} className="!text-white !mb-4">
              Order Items
            </Title>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <Text className="text-white font-medium">
                      {item.collection?.name} - {item.collection_sr_no?.sr_no}
                    </Text>
                    <br />
                    <Text className="text-gray-400 text-sm">
                      Quantity: {item.quantity} {item.collection_sr_no?.unit}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Status Update Modal */}
        <Modal
          title={<span className="text-white">Update Order Status</span>}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          className="dark-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleStatusUpdate}
          >
            <Form.Item
              label={<span className="text-gray-300">Order Status</span>}
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                placeholder="Select new status"
                className="bg-gray-700 border-gray-600"
                size="large"
              >
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="SHIPPED">Shipped</Option>
                <Option value="DELIVERED">Delivered</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex space-x-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<Save className="w-4 h-4" />}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Update Status
                </Button>
                <Button
                  onClick={() => setIsModalVisible(false)}
                  icon={<X className="w-4 h-4" />}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};