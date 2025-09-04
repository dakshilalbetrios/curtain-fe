import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { Package, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../Layout/MainLayout';
import { mockCollections } from '../../data/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CollectionFormData {
  name: string;
  description: string;
}

interface SerialNumberData {
  sr_no: string;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  unit: 'mtr' | 'pcs';
}

export const AddCollection: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumberData[]>([
    { sr_no: '', min_stock: 0, max_stock: 0, current_stock: 0, unit: 'mtr' }
  ]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEdit = !!id;
  const collection = isEdit ? mockCollections.find(c => c.id === parseInt(id)) : null;

  useEffect(() => {
    if (isEdit && collection) {
      form.setFieldsValue({
        name: collection.name,
        description: collection.description
      });
      
      if (collection.serial_numbers && collection.serial_numbers.length > 0) {
        setSerialNumbers(collection.serial_numbers.map(sr => ({
          sr_no: sr.sr_no,
          min_stock: sr.min_stock,
          max_stock: sr.max_stock,
          current_stock: sr.current_stock,
          unit: sr.unit
        })));
      }
    }
  }, [isEdit, collection, form]);

  const handleSubmit = async (values: CollectionFormData) => {
    // Validate serial numbers
    const validSerialNumbers = serialNumbers.filter(sr => sr.sr_no.trim() !== '');
    if (validSerialNumbers.length === 0) {
      message.error('Please add at least one serial number');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Collection ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/collections');
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} collection`);
    } finally {
      setLoading(false);
    }
  };

  const addSerialNumber = () => {
    setSerialNumbers([...serialNumbers, { sr_no: '', min_stock: 0, max_stock: 0, current_stock: 0, unit: 'mtr' }]);
  };

  const removeSerialNumber = (index: number) => {
    if (serialNumbers.length > 1) {
      setSerialNumbers(serialNumbers.filter((_, i) => i !== index));
    }
  };

  const updateSerialNumber = (index: number, field: keyof SerialNumberData, value: any) => {
    const updated = [...serialNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setSerialNumbers(updated);
  };

  return (
    <MainLayout title={isEdit ? 'Edit Collection' : 'Add Collection'} showBack={true}>
      <Card className="bg-gray-800 border-gray-700">
        <Title level={4} className="!text-white !mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          {isEdit ? 'Edit Collection' : 'Create New Collection'}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={<span className="text-gray-300">Collection Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter collection name' }]}
          >
            <Input
              placeholder="Enter collection name"
              className="bg-gray-700 border-gray-600 text-white"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300">Description</span>}
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              placeholder="Enter collection description"
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </Form.Item>

          <Divider className="border-gray-600" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Title level={5} className="!text-white !mb-0">
                Serial Numbers
              </Title>
              <Button
                type="dashed"
                icon={<Plus className="w-4 h-4" />}
                onClick={addSerialNumber}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Add Item
              </Button>
            </div>

            {serialNumbers.map((srNo, index) => (
              <Card key={index} className="bg-gray-700 border-gray-600">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-300 font-medium">Item {index + 1}</Text>
                    {serialNumbers.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => removeSerialNumber(index)}
                        className="text-red-400 hover:text-red-300"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Text className="text-gray-300 text-sm">Serial Number</Text>
                      <Input
                        value={srNo.sr_no}
                        onChange={(e) => updateSerialNumber(index, 'sr_no', e.target.value)}
                        placeholder="e.g., PC001"
                        className="bg-gray-600 border-gray-500 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Text className="text-gray-300 text-sm">Unit</Text>
                      <select
                        value={srNo.unit}
                        onChange={(e) => updateSerialNumber(index, 'unit', e.target.value)}
                        className="w-full h-8 bg-gray-600 border border-gray-500 text-white rounded mt-1 px-2"
                      >
                        <option value="mtr">Meter</option>
                        <option value="pcs">Pieces</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Text className="text-gray-300 text-sm">Min Stock</Text>
                      <Input
                        type="number"
                        value={srNo.min_stock}
                        onChange={(e) => updateSerialNumber(index, 'min_stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-gray-600 border-gray-500 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Text className="text-gray-300 text-sm">Max Stock</Text>
                      <Input
                        type="number"
                        value={srNo.max_stock}
                        onChange={(e) => updateSerialNumber(index, 'max_stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-gray-600 border-gray-500 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Text className="text-gray-300 text-sm">Current Stock</Text>
                      <Input
                        type="number"
                        value={srNo.current_stock}
                        onChange={(e) => updateSerialNumber(index, 'current_stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-gray-600 border-gray-500 text-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<Save className="w-4 h-4" />}
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              {isEdit ? 'Update Collection' : 'Create Collection'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
};