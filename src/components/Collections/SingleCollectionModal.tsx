import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Card,
  Typography,
} from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CollectionResponse } from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SingleCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  editingCollection: CollectionResponse | null;
  form: any;
  formLoading: boolean;
}

export const SingleCollectionModal: React.FC<SingleCollectionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingCollection,
  form,
  formLoading,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center mb-2">
          {editingCollection ? (
            <Edit className="w-5 h-5 mr-2 text-purple-400" />
          ) : (
            <Plus className="w-5 h-5 mr-2 text-purple-400" />
          )}
          <span className="theme-text-primary">
            {editingCollection ? "Edit Collection" : "Add New Collection"}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="single-collection-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          serial_numbers: [
            {
              sr_no: "",
              min_stock: "",
              max_stock: "",
              current_stock: "",
              unit: "pcs",
              isExisting: false,
            },
          ],
        }}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span className="theme-text-secondary">Collection Name</span>
              }
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter collection name",
                },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                placeholder="Enter collection name"
                className="theme-input"
                size="large"
                autoComplete="off"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="theme-text-secondary">Description</span>}
              name="description"
              rules={[
                { required: true, message: "Please enter description" },
                {
                  min: 5,
                  message: "Description must be at least 5 characters",
                },
              ]}
            >
              <TextArea
                placeholder="Enter collection description"
                className="theme-input"
                size="large"
                rows={3}
              />
            </Form.Item>
          </Col>
        </Row>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Title level={5} className="!theme-text-primary !mb-0">
              Serial Numbers
            </Title>
            <Button
              type="dashed"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                const currentSerialNumbers =
                  form.getFieldValue("serial_numbers") || [];
                form.setFieldsValue({
                  serial_numbers: [
                    ...currentSerialNumbers,
                    {
                      sr_no: "",
                      min_stock: "",
                      max_stock: "",
                      current_stock: "",
                      unit: "pcs",
                      isExisting: false,
                    },
                  ],
                });
              }}
              className="border-purple-500 text-purple-400 hover:border-purple-400"
            >
              Add Serial Number
            </Button>
          </div>

          <Form.List name="serial_numbers">
            {(fields, { remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    className="theme-card"
                    title={
                      <div className="flex items-center justify-between">
                        <Text className="theme-text-primary">
                          Serial Number {name + 1}
                        </Text>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => remove(name)}
                            className="text-red-400 hover:text-red-300"
                          />
                        )}
                      </div>
                    }
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "sr_no"]}
                          label={
                            <span className="theme-text-secondary">
                              Serial Number
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please enter serial number",
                            },
                          ]}
                        >
                          <Input
                            placeholder="e.g., SR-001"
                            className="theme-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "unit"]}
                          label={
                            <span className="theme-text-secondary">Unit</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select unit",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select unit"
                            className="theme-input"
                          >
                            <Option value="pcs">Pieces</Option>
                            <Option value="mtr">Meters</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "min_stock"]}
                          label={
                            <span className="theme-text-secondary">
                              Min Stock
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please enter min stock",
                            },
                            {
                              pattern: /^\d+(\.\d+)?$/,
                              message: "Please enter valid number",
                            },
                          ]}
                        >
                          <Input placeholder="0" className="theme-input" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "max_stock"]}
                          label={
                            <span className="theme-text-secondary">
                              Max Stock
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please enter max stock",
                            },
                            {
                              pattern: /^\d+(\.\d+)?$/,
                              message: "Please enter valid number",
                            },
                          ]}
                        >
                          <Input placeholder="100" className="theme-input" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "current_stock"]}
                          label={
                            <span className="theme-text-secondary">
                              Current Stock
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please enter current stock",
                            },
                            {
                              pattern: /^\d+(\.\d+)?$/,
                              message: "Please enter valid number",
                            },
                          ]}
                        >
                          <Input
                            placeholder="50"
                            className="theme-input"
                            disabled={form.getFieldValue([
                              "serial_numbers",
                              name,
                              "isExisting",
                            ])}
                            title={
                              form.getFieldValue([
                                "serial_numbers",
                                name,
                                "isExisting",
                              ])
                                ? "Current stock cannot be edited for existing items"
                                : ""
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>
        </div>

        <Form.Item className="mb-0">
          <div className="flex gap-3 justify-end">
            <Button onClick={onClose} size="large" className="theme-button">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              {editingCollection ? "Update Collection" : "Create Collection"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
