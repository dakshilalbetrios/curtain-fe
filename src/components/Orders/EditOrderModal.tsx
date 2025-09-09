import React from "react";
import {
  Modal,
  Form,
  Button,
  Select,
  Card,
  Typography,
  Skeleton,
  Empty,
  InputNumber,
} from "antd";
import {
  Edit,
  Trash2,
  Plus,
  Minus,
  Package,
} from "lucide-react";
import { OrderResponse, CollectionResponse } from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;

interface EditOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  editingOrder: OrderResponse | null;
  form: any;
  formLoading: boolean;
  loadingCollections: boolean;
  accessibleCollections: CollectionResponse[];
  collections: CollectionResponse[];
  selectedCollections: { [key: number]: CollectionResponse | null };
  selectedSerialNumbers: { [key: number]: number | null };
  onCollectionChange: (itemIndex: number, collectionId: number) => void;
  onSerialNumberChange: (itemIndex: number, serialNumberId: number) => void;
  onQuantityDirectChange: (itemIndex: number, value: number | null) => void;
  onAdjustQuantity: (itemIndex: number, delta: number) => void;
  getAvailableStockFor: (itemIndex: number) => number;
  getUnitFor: (itemIndex: number) => string;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingOrder,
  form,
  formLoading,
  loadingCollections,
  accessibleCollections,
  collections,
  selectedCollections,
  selectedSerialNumbers,
  onCollectionChange,
  onSerialNumberChange,
  onQuantityDirectChange,
  onAdjustQuantity,
  getAvailableStockFor,
  getUnitFor,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center mb-2">
          <Edit className="w-5 h-5 mr-2 text-purple-400" />
          <span className="theme-text-primary">
            Edit Order #{editingOrder?.id}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="edit-order-modal"
    >
      {loadingCollections ? (
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : accessibleCollections.length === 0 ? (
        <Empty
          image={
            <Package className="w-16 h-16 theme-text-tertiary mx-auto" />
          }
          description={
            <div className="text-center">
              <Title level={5} className="!theme-text-secondary !mb-2">
                No Collections Available
              </Title>
              <Text className="theme-text-tertiary">
                You don't have access to any collections yet. Contact your
                administrator to get access.
              </Text>
            </div>
          }
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            order_items: [
              {
                collection_id: null,
                collection_sr_no_id: null,
                quantity: "",
                isExisting: false,
              },
            ],
          }}
          autoComplete="off"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Title level={5} className="!theme-text-primary !mb-0">
                Order Items
              </Title>
              <Button
                type="dashed"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  const currentOrderItems =
                    form.getFieldValue("order_items") || [];
                  const newIndex = currentOrderItems.length;
                  form.setFieldsValue({
                    order_items: [
                      ...currentOrderItems,
                      {
                        collection_id: null,
                        collection_sr_no_id: null,
                        quantity: "",
                        isExisting: false,
                      },
                    ],
                  });
                }}
                className="border-purple-500 text-purple-400 hover:border-purple-400"
              >
                Add Item
              </Button>
            </div>

            <Form.List name="order_items">
              {(fields, { remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      className="theme-card"
                      title={
                        <div className="flex items-center justify-between">
                          <Text className="theme-text-primary">
                            Order Item {name + 1}
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Collection Selection */}
                        <div className="space-y-2">
                          <Text className="theme-text-secondary font-medium">
                            Collection
                          </Text>
                          <Select
                            placeholder="Select a collection"
                            value={selectedCollections[name]?.id}
                            onChange={(collectionId) =>
                              onCollectionChange(name, collectionId)
                            }
                            className="w-full theme-input"
                            size="large"
                            showSearch
                            loading={loadingCollections}
                            filterOption={(input, option) =>
                              (option?.label as string)
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {(form.getFieldValue("order_items")[name]
                              ?.isExisting
                              ? collections
                              : accessibleCollections
                            ).map((collection) => (
                              <Option
                                key={collection.id}
                                value={collection.id}
                              >
                                {collection.name}
                              </Option>
                            ))}
                          </Select>
                        </div>

                        {/* Serial Number Selection */}
                        <div className="space-y-2">
                          <Text className="theme-text-secondary font-medium">
                            Serial Number
                          </Text>
                          <Select
                            placeholder="Select serial number"
                            value={
                              selectedSerialNumbers[name] ?? undefined
                            }
                            onChange={(serialNumberId) =>
                              onSerialNumberChange(
                                name,
                                serialNumberId
                              )
                            }
                            className="w-full theme-input"
                            size="large"
                            showSearch
                            disabled={!selectedCollections[name]}
                            filterOption={(input, option) =>
                              (option?.label as string)
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {selectedCollections[
                              name
                            ]?.serial_numbers?.map((serialNumber) => (
                              <Option
                                key={serialNumber.id}
                                value={serialNumber.id}
                              >
                                {serialNumber.sr_no}
                              </Option>
                            ))}
                          </Select>
                        </div>

                        {/* Quantity Input */}
                        <div className="space-y-2">
                          <Text className="theme-text-secondary font-medium">
                            Quantity
                          </Text>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Please enter quantity",
                              },
                              {
                                pattern: /^\d+(\.\d+)?$/,
                                message: "Please enter valid number",
                              },
                            ]}
                            className="mb-0"
                          >
                            <div className="flex items-center space-x-2">
                              <Button
                                icon={<Minus className="w-4 h-4" />}
                                onClick={() => onAdjustQuantity(name, -0.5)}
                                disabled={
                                  !(
                                    form.getFieldValue([
                                      "order_items",
                                      name,
                                      "quantity",
                                    ]) || 0
                                  ) ||
                                  form.getFieldValue([
                                    "order_items",
                                    name,
                                    "quantity",
                                  ]) <= 1
                                }
                                className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                                style={{
                                  minWidth: "40px",
                                  minHeight: "40px",
                                }}
                              />
                              <InputNumber
                                min={1}
                                value={
                                  form.getFieldValue([
                                    "order_items",
                                    name,
                                    "quantity",
                                  ]) || 1
                                }
                                onChange={(v) =>
                                  onQuantityDirectChange(
                                    name,
                                    v as number | null
                                  )
                                }
                                className="w-8 theme-input !align-center !justify-center !border-none"
                                controls={false}
                                size="small"
                                style={{
                                  height: "40px",
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                disabled={!selectedSerialNumbers[name]}
                              />
                              <Button
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => onAdjustQuantity(name, 0.5)}
                                disabled={(() => {
                                  const qty = parseFloat(
                                    (
                                      form.getFieldValue([
                                        "order_items",
                                        name,
                                        "quantity",
                                      ]) || 0
                                    ).toString()
                                  );
                                  const max = getAvailableStockFor(name);
                                  return (
                                    !selectedSerialNumbers[name] ||
                                    (max > 0 && qty >= max)
                                  );
                                })()}
                                className="w-10 h-10 rounded-full p-0 flex items-center justify-center theme-button border theme-border-primary hover:theme-bg-tertiary"
                                style={{
                                  minWidth: "40px",
                                  minHeight: "40px",
                                }}
                              />
                              <Text className="theme-text-secondary text-sm ml-2">
                                {getUnitFor(name)}
                              </Text>
                            </div>
                          </Form.Item>
                          {/* Show available stock */}
                          {selectedCollections[name] &&
                            selectedSerialNumbers[name] && (
                              <Text className="text-xs theme-text-tertiary">
                                Available Stock:{" "}
                                {
                                  selectedCollections[
                                    name
                                  ]?.serial_numbers?.find(
                                    (sr) =>
                                      sr.id ===
                                      selectedSerialNumbers[name]
                                  )?.current_stock
                                }{" "}
                                {
                                  selectedCollections[
                                    name
                                  ]?.serial_numbers?.find(
                                    (sr) =>
                                      sr.id ===
                                      selectedSerialNumbers[name]
                                  )?.unit
                                }
                              </Text>
                            )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Form.List>
          </div>

          <Form.Item className="mb-0">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                size="large"
                className="theme-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                Update Order
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
