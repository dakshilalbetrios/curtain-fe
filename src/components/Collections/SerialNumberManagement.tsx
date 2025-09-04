import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  InputNumber,
  Input,
  Select,
  Modal,
  Form,
  message,
  Space,
} from "antd";
import { Plus, Edit, Trash2, Package, Minus, ShoppingCart } from "lucide-react";
import { collectionService, CollectionSerialNumber } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SerialNumberManagementProps {
  collectionId: number;
  serialNumbers: CollectionSerialNumber[];
  onSerialNumbersUpdate: () => void;
  collectionName?: string;
}

interface AddSerialNumberFormData {
  sr_no: string;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  unit: "mtr" | "pcs";
}

interface UpdateStockFormData {
  quantity: number;
  reason: string;
}

export const SerialNumberManagement: React.FC<SerialNumberManagementProps> = ({
  collectionId,
  serialNumbers,
  onSerialNumbersUpdate,
  collectionName = "",
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSerialNumber, setSelectedSerialNumber] =
    useState<CollectionSerialNumber | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const { user } = useAuth();
  const { addToCart } = useCart();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";
  const isRetailer = user?.role === "CUSTOMER";

  const handleAddSerialNumber = async (values: AddSerialNumberFormData) => {
    setLoading(true);
    try {
      await collectionService.addSerialNumber(collectionId, values);
      message.success("Serial number added successfully!");
      setAddModalVisible(false);
      addForm.resetFields();
      onSerialNumbersUpdate();
    } catch (error) {
      message.error("Failed to add serial number");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (values: UpdateStockFormData) => {
    if (!selectedSerialNumber) return;

    setLoading(true);
    try {
      await collectionService.updateSerialNumberStock(selectedSerialNumber.id, {
        action: "IN",
        quantity: values.quantity,
        reason: values.reason,
      });
      message.success("Stock updated successfully!");
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedSerialNumber(null);
      onSerialNumbersUpdate();
    } catch (error) {
      message.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSerialNumber = (serialNumber: CollectionSerialNumber) => {
    Modal.confirm({
      title: "Delete Serial Number",
      content: `Are you sure you want to delete serial number "${serialNumber.sr_no}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await collectionService.deleteSerialNumber(serialNumber.id);
          message.success(
            `Serial number "${serialNumber.sr_no}" deleted successfully!`
          );
          onSerialNumbersUpdate();
        } catch (error) {
          message.error(
            `Failed to delete serial number "${serialNumber.sr_no}"`
          );
        }
      },
    });
  };

  const openEditModal = (serialNumber: CollectionSerialNumber) => {
    setSelectedSerialNumber(serialNumber);
    setEditModalVisible(true);
  };

  const handleQuantityChange = (srNoId: number, value: number | null) => {
    setQuantities((prev) => ({
      ...prev,
      [srNoId]: value || 0,
    }));
  };

  const handleAddToCart = (srNo: CollectionSerialNumber) => {
    const quantity = quantities[srNo.id] || 0;
    if (quantity <= 0) {
      message.error("Please enter a valid quantity");
      return;
    }
    if (quantity > parseFloat(srNo.current_stock)) {
      message.error("Quantity exceeds available stock");
      return;
    }

    addToCart({
      collection_sr_no_id: srNo.id,
      sr_no: srNo.sr_no,
      collection_name: collectionName,
      quantity: quantity,
      unit: srNo.unit,
      available_stock: parseFloat(srNo.current_stock),
    });

    message.success("Added to cart successfully");
    setQuantities((prev) => ({ ...prev, [srNo.id]: 0 }));
  };

  const getStockStatus = (
    currentStock: string,
    minStock: string,
    maxStock: string
  ) => {
    const current = parseFloat(currentStock);
    const min = parseFloat(minStock);
    const max = parseFloat(maxStock);

    if (current <= min) {
      return { level: "low", color: "red" };
    } else if (current >= max) {
      return { level: "high", color: "green" };
    } else {
      return { level: "medium", color: "orange" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      {isWholesaler && (
        <div className="flex justify-between items-center">
          <Title level={4} className="!text-white !mb-0">
            Serial Numbers ({serialNumbers.length})
          </Title>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setAddModalVisible(true)}
            className="bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Add Serial Number
          </Button>
        </div>
      )}

      {/* Serial Numbers Grid */}
      <Row gutter={[16, 16]}>
        {serialNumbers.map((srNo) => {
          const stockStatus = getStockStatus(
            srNo.current_stock,
            srNo.min_stock,
            srNo.max_stock
          );
          const stockPercentage =
            (parseFloat(srNo.current_stock) / parseFloat(srNo.max_stock)) * 100;

          return (
            <Col xs={24} sm={12} lg={8} key={srNo.id}>
              <Card className="bg-gray-800 border-gray-700 h-80">
                <div className="space-y-4 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-purple-400" />
                      <Title level={5} className="!text-white !mb-0">
                        {srNo.sr_no}
                      </Title>
                    </div>
                    {isWholesaler && (
                      <Space>
                        <Button
                          type="link"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => openEditModal(srNo)}
                          className="!text-purple-400 hover:!text-purple-300 !p-0 !h-auto"
                        />
                        <Button
                          type="link"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDeleteSerialNumber(srNo)}
                          className="!text-red-400 hover:!text-red-300 !p-0 !h-auto"
                        />
                      </Space>
                    )}
                  </div>

                  {/* Stock Status */}
                  {isWholesaler && (
                    <div className="flex items-center justify-between">
                      <Tag color={stockStatus.color}>
                        {stockStatus.level.toUpperCase()}
                      </Tag>
                      <Text className="text-gray-400 text-sm">
                        {srNo.unit.toUpperCase()}
                      </Text>
                    </div>
                  )}

                  {/* Stock Progress */}
                  {isWholesaler && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Text className="text-gray-400">Stock Level</Text>
                        <Text className="text-white">
                          {srNo.current_stock} / {srNo.max_stock}
                        </Text>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stockStatus.level === "low"
                              ? "bg-red-500"
                              : stockStatus.level === "high"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.min(stockPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stock Details */}
                  {isWholesaler ? (
                    <div className="grid grid-cols-2 gap-2 text-sm flex-1">
                      <div>
                        <Text className="text-gray-400">Min Stock:</Text>
                        <br />
                        <Text className="text-white font-medium">
                          {srNo.min_stock} {srNo.unit}
                        </Text>
                      </div>
                      <div>
                        <Text className="text-gray-400">Max Stock:</Text>
                        <br />
                        <Text className="text-white font-medium">
                          {srNo.max_stock} {srNo.unit}
                        </Text>
                      </div>
                      <div>
                        <Text className="text-gray-400">Current:</Text>
                        <br />
                        <Text className="text-white font-medium">
                          {srNo.current_stock} {srNo.unit}
                        </Text>
                      </div>
                      <div>
                        <Text className="text-gray-400">Available:</Text>
                        <br />
                        <Text className="text-white font-medium">
                          {srNo.current_stock} {srNo.unit}
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center flex-1 flex items-center justify-center">
                      <div>
                        <Text className="text-gray-400 text-sm">
                          Available:
                        </Text>
                        <br />
                        <Text className="text-white font-medium text-lg">
                          {srNo.current_stock} {srNo.unit}
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Cart Functionality for Retailers */}
                  {isRetailer && parseFloat(srNo.current_stock) > 0 && (
                    <div className="space-y-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <Text className="text-gray-300">Quantity:</Text>
                        <Space.Compact>
                          <Button
                            icon={<Minus className="w-4 h-4" />}
                            onClick={() =>
                              handleQuantityChange(
                                srNo.id,
                                Math.max(0, (quantities[srNo.id] || 0) - 1)
                              )
                            }
                            disabled={(quantities[srNo.id] || 0) <= 0}
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          />
                          <InputNumber
                            min={0}
                            max={parseFloat(srNo.current_stock)}
                            step={0.5}
                            value={quantities[srNo.id] || 0}
                            onChange={(value) =>
                              handleQuantityChange(srNo.id, value)
                            }
                            className="w-20 text-center bg-gray-700 border-gray-600"
                            controls={false}
                          />
                          <Button
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() =>
                              handleQuantityChange(
                                srNo.id,
                                Math.min(
                                  parseFloat(srNo.current_stock),
                                  (quantities[srNo.id] || 0) + 1
                                )
                              )
                            }
                            disabled={
                              (quantities[srNo.id] || 0) >=
                              parseFloat(srNo.current_stock)
                            }
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          />
                        </Space.Compact>
                      </div>

                      <Button
                        type="primary"
                        icon={<ShoppingCart className="w-4 h-4" />}
                        onClick={() => handleAddToCart(srNo)}
                        disabled={(quantities[srNo.id] || 0) <= 0}
                        className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  )}

                  {isRetailer && parseFloat(srNo.current_stock) === 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <Button disabled className="w-full">
                        Out of Stock
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Add Serial Number Modal */}
      <Modal
        title="Add Serial Number"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
        className="serial-number-modal"
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSerialNumber}
          className="mt-4"
        >
          <Form.Item
            name="sr_no"
            label="Serial Number"
            rules={[{ required: true, message: "Please enter serial number" }]}
          >
            <Input placeholder="e.g., SN001" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="min_stock"
                label="Min Stock"
                rules={[{ required: true, message: "Please enter min stock" }]}
              >
                <InputNumber min={0} placeholder="10" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_stock"
                label="Max Stock"
                rules={[{ required: true, message: "Please enter max stock" }]}
              >
                <InputNumber min={0} placeholder="100" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="current_stock"
                label="Current Stock"
                rules={[
                  { required: true, message: "Please enter current stock" },
                ]}
              >
                <InputNumber min={0} placeholder="50" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: "Please select unit" }]}
              >
                <Select placeholder="Select unit">
                  <Option value="mtr">Meter (mtr)</Option>
                  <Option value="pcs">Pieces (pcs)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setAddModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Add Serial Number
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Stock Modal */}
      <Modal
        title={`Update Stock - ${selectedSerialNumber?.sr_no}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedSerialNumber(null);
        }}
        footer={null}
        className="serial-number-modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateStock}
          className="mt-4"
        >
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <Text className="text-gray-600">
              Current Stock:{" "}
              <strong>
                {selectedSerialNumber?.current_stock}{" "}
                {selectedSerialNumber?.unit}
              </strong>
            </Text>
          </div>

          <Form.Item
            name="quantity"
            label="Quantity to Add"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber
              min={1}
              placeholder="Enter quantity to add"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <TextArea rows={3} placeholder="e.g., Restocked from supplier" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                  setSelectedSerialNumber(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Update Stock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
