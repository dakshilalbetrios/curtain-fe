import React from 'react';
import { Card, Typography, Tag, Button, Timeline, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import { Download, Truck, Clock, CheckCircle, XCircle, Package, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { allOrders } from '../../data/mockData';
import { MainLayout } from '../Layout/MainLayout';
import moment from 'moment';

const { Title, Text } = Typography;

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orderId = parseInt(id || '0');
  const order = allOrders.find(o => o.id === orderId);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'DELIVERED': return <Package className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const timelineItems = [
    {
      dot: getStatusIcon('PENDING'),
      children: (
        <div>
          <Text className="text-white font-medium">Pending</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).format('MMM DD, YYYY, hh:mm A')}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            We have received your order.
          </Text>
        </div>
      ),
    },
    ...(order.status !== 'CANCELLED' && order.status !== 'PENDING' ? [{
      dot: getStatusIcon('APPROVED'),
      children: (
        <div>
          <Text className="text-white font-medium">Approved</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).add(5, 'hours').format('MMM DD, YYYY, hh:mm A')}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            Your order has been approved.
          </Text>
        </div>
      ),
    }] : []),
    ...(order.status === 'SHIPPED' || order.status === 'DELIVERED' ? [{
      dot: getStatusIcon('SHIPPED'),
      children: (
        <div>
          <Text className="text-white font-medium">Shipped</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).add(1, 'day').format('MMM DD, YYYY, hh:mm A')}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            Your order has been shipped from our warehouse.
          </Text>
        </div>
      ),
    }] : []),
    ...(order.status === 'DELIVERED' ? [{
      dot: getStatusIcon('DELIVERED'),
      children: (
        <div>
          <Text className="text-white font-medium">Delivered</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).add(3, 'days').format('MMM DD, YYYY, hh:mm A')}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            Your order has been delivered.
          </Text>
        </div>
      ),
    }] : []),
    ...(order.status === 'CANCELLED' ? [{
      dot: getStatusIcon('CANCELLED'),
      children: (
        <div>
          <Text className="text-white font-medium">Cancelled</Text>
          <br />
          <Text className="text-gray-400 text-sm">
            {moment(order.created_at).add(2, 'hours').format('MMM DD, YYYY, hh:mm A')}
          </Text>
          <br />
          <Text className="text-gray-400 text-sm">
            Order has been cancelled.
          </Text>
        </div>
      ),
    }] : []),
  ];

  return (
    <MainLayout title="Order Details" showBack={true}>
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
              {isAdmin && (
                <Button
                  type="primary"
                  icon={<Settings className="w-4 h-4" />}
                  onClick={() => navigate(`/orders/${order.id}/manage`)}
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Manage
                </Button>
              )}
            </div>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Button
                icon={<Download className="w-4 h-4" />}
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                disabled={order.status === 'PENDING' || order.status === 'CANCELLED'}
              >
                Download Invoice
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                icon={<Truck className="w-4 h-4" />}
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                disabled={order.status !== 'SHIPPED' && order.status !== 'DELIVERED'}
              >
                Track Shipment
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Order Status Timeline */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4">
            Order Status
          </Title>
          <Timeline
            items={timelineItems}
            className="custom-timeline"
          />
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
      </div>
    </MainLayout>
  );
};