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
import { Plus, Trash2, Package, PlusCircle } from "lucide-react";
import { collectionService, CollectionSerialNumber } from "../../services";
import { useAuth } from "../../context/AuthContext";

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
  const { user } = useAuth();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

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
    <div className="flex flex-col h-full min-h-0 max-h-full">
      {/* Fixed Header Section */}
      {isWholesaler && (
        <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 pb-4 -mx-4 px-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <Title level={4} className="!theme-text-primary !mb-0">
              {collectionName} ({serialNumbers.length})
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
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 min-h-0 max-h-full -mr-4 pr-4 pb-16 lg:pb-6">
        {/* Serial Numbers Grid */}
        <Row gutter={[16, 16]}>
          {serialNumbers.map((srNo) => {
            const stockStatus = getStockStatus(
              srNo.current_stock,
              srNo.min_stock,
              srNo.max_stock
            );
            const stockPercentage =
              (parseFloat(srNo.current_stock) / parseFloat(srNo.max_stock)) *
              100;

            return (
              <Col xs={24} sm={12} lg={8} key={srNo.id}>
                <Card className="theme-card h-full">
                  <div className="space-y-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <Title level={5} className="!theme-text-primary !mb-0">
                          {srNo.sr_no}
                        </Title>
                      </div>
                      {isWholesaler && (
                        <Space>
                          <Button
                            type="link"
                            icon={<PlusCircle className="w-4 h-4" />}
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

                    {/* Stock Status and Unit */}
                    <div className="flex items-center justify-between">
                      <Tag
                        color={stockStatus.color}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {stockStatus.level.toUpperCase()}
                      </Tag>
                      <Text className="theme-text-secondary text-sm font-medium">
                        {srNo.unit.toUpperCase()}
                      </Text>
                    </div>

                    {/* Stock Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Text className="theme-text-secondary text-sm">
                          Stock Level
                        </Text>
                        <Text className="theme-text-primary font-semibold">
                          {srNo.current_stock}
                        </Text>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full theme-bg-tertiary rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
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
                        <div className="flex justify-between text-xs">
                          <Text className="theme-text-tertiary">
                            {srNo.min_stock}
                          </Text>
                          <Text className="theme-text-tertiary">
                            {srNo.max_stock}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Add Serial Number Modal */}
      <Modal
        title={<span className="theme-text-primary">Add Serial Number</span>}
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
            label={<span className="theme-text-secondary">Serial Number</span>}
            rules={[{ required: true, message: "Please enter serial number" }]}
          >
            <Input placeholder="e.g., SN001" className="theme-input" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="min_stock"
                label={<span className="theme-text-secondary">Min Stock</span>}
                rules={[{ required: true, message: "Please enter min stock" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="10"
                  className="w-full theme-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_stock"
                label={<span className="theme-text-secondary">Max Stock</span>}
                rules={[{ required: true, message: "Please enter max stock" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="100"
                  className="w-full theme-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="current_stock"
                label={
                  <span className="theme-text-secondary">Current Stock</span>
                }
                rules={[
                  { required: true, message: "Please enter current stock" },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="50"
                  className="w-full theme-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label={<span className="theme-text-secondary">Unit</span>}
                rules={[{ required: true, message: "Please select unit" }]}
              >
                <Select placeholder="Select unit" className="theme-input">
                  <Option value="mtr">Meter (mtr)</Option>
                  <Option value="pcs">Pieces (pcs)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => setAddModalVisible(false)}
                className="theme-button"
              >
                Cancel
              </Button>
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
        title={
          <span className="theme-text-primary">
            Update Stock - {selectedSerialNumber?.sr_no}
          </span>
        }
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
          <div className="mb-4 p-3 theme-bg-tertiary rounded">
            <Text className="theme-text-secondary">
              Current Stock:{" "}
              <strong className="theme-text-primary">
                {selectedSerialNumber?.current_stock}{" "}
                {selectedSerialNumber?.unit}
              </strong>
            </Text>
          </div>

          <Form.Item
            name="quantity"
            label={
              <span className="theme-text-secondary">Quantity to Add</span>
            }
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber
              min={1}
              placeholder="Enter quantity to add"
              className="w-full theme-input"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<span className="theme-text-secondary">Reason</span>}
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <TextArea
              rows={3}
              placeholder="e.g., Restocked from supplier"
              className="theme-input"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                  setSelectedSerialNumber(null);
                }}
                className="theme-button"
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
