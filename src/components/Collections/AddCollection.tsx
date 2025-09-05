import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  message,
  Row,
  Col,
  Upload,
} from "antd";
import {
  Package,
  Plus,
  Minus,
  Upload as UploadIcon,
  Download,
  Edit,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collectionService,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CollectionResponse,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface SerialNumberFormData {
  id?: number;
  sr_no: string;
  min_stock: string;
  max_stock: string;
  current_stock: string;
  unit: "mtr" | "pcs";
  isExisting?: boolean;
}

interface CollectionFormData {
  name: string;
  description: string;
  serial_numbers: SerialNumberFormData[];
}

export const AddCollection: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionResponse | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      setEditMode(true);
      loadCollectionData(parseInt(id));
    }
  }, [id]);

  const loadCollectionData = async (collectionId: number) => {
    try {
      const collection = await collectionService.getCollectionById(
        collectionId
      );
      setEditingCollection(collection);
      form.setFieldsValue({
        name: collection.name,
        description: collection.description,
        serial_numbers:
          collection.serial_numbers?.map((sr) => ({
            id: sr.id,
            sr_no: sr.sr_no,
            min_stock: sr.min_stock,
            max_stock: sr.max_stock,
            current_stock: sr.current_stock,
            unit: sr.unit,
            isExisting: true,
          })) || [],
      });
    } catch (error) {
      console.error("Failed to load collection data:", error);
      message.error("Failed to load collection data");
      navigate("/collections");
    }
  };

  const handleSubmit = async (values: CollectionFormData) => {
    setLoading(true);
    try {
      if (editMode && editingCollection) {
        // Update existing collection with action-based payload
        const updatePayload: UpdateCollectionRequest = {
          name: values.name,
          description: values.description,
          serial_numbers: values.serial_numbers.map((sr) => {
            if (sr.isExisting) {
              // Existing serial number - update action
              return {
                _action: "update" as const,
                id: sr.id!,
                min_stock: sr.min_stock,
                max_stock: sr.max_stock,
                // Note: current_stock is not included as it should not be editable
              };
            } else {
              // New serial number - create action
              return {
                _action: "create" as const,
                sr_no: sr.sr_no,
                min_stock: sr.min_stock,
                max_stock: sr.max_stock,
                current_stock: sr.current_stock,
                unit: sr.unit,
              };
            }
          }),
        };

        // Add delete actions for removed serial numbers
        const originalSerialNumbers = editingCollection.serial_numbers || [];
        const currentSerialIds = values.serial_numbers
          .filter((sr) => sr.isExisting)
          .map((sr) => sr.id);

        const deletedSerialNumbers = originalSerialNumbers
          .filter((sr) => !currentSerialIds.includes(sr.id))
          .map((sr) => ({
            _action: "delete" as const,
            id: sr.id,
          }));

        updatePayload.serial_numbers = [
          ...updatePayload.serial_numbers,
          ...deletedSerialNumbers,
        ];

        await collectionService.updateCollection(
          editingCollection.id,
          updatePayload
        );
        message.success("Collection updated successfully!");
      } else {
        // Create new collection
        await collectionService.createCollection(values);
        message.success("Collection created successfully!");
      }
      navigate("/collections");
    } catch (error) {
      message.error(
        editMode ? "Failed to update collection" : "Failed to create collection"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSerialNumber = () => {
    const currentSerialNumbers = form.getFieldValue("serial_numbers") || [];
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
  };

  const handleRemoveSerialNumber = (index: number) => {
    const currentSerialNumbers = form.getFieldValue("serial_numbers") || [];
    const newSerialNumbers = currentSerialNumbers.filter(
      (_: any, i: number) => i !== index
    );
    form.setFieldsValue({
      serial_numbers: newSerialNumbers,
    });
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const parseCSVToCollections = (
    csvContent: string
  ): CreateCollectionRequest[] => {
    const lines = csvContent.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row"
      );
    }

    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().replace(/\r/g, ""));
    console.log("CSV Headers:", headers);

    const requiredHeaders = [
      "collection_name",
      "description",
      "sr_no",
      "min_stock",
      "max_stock",
      "current_stock",
      "unit",
    ];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required columns: ${missingHeaders.join(
          ", "
        )}. Found columns: ${headers.join(", ")}`
      );
    }

    const collectionsMap = new Map<string, CreateCollectionRequest>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line).map((value) =>
        value.replace(/\r/g, "")
      );

      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: column count mismatch`);
        continue;
      }

      const row: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      const collectionName = row.collection_name;
      const description = row.description;
      const srNo = row.sr_no;
      const minStock = row.min_stock;
      const maxStock = row.max_stock;
      const currentStock = row.current_stock;
      const unit = row.unit;

      if (
        !collectionName ||
        !description ||
        !srNo ||
        !minStock ||
        !maxStock ||
        !currentStock ||
        !unit
      ) {
        console.warn(`Skipping row ${i + 1}: missing required data`);
        continue;
      }

      if (!collectionsMap.has(collectionName)) {
        collectionsMap.set(collectionName, {
          name: collectionName,
          description: description,
          serial_numbers: [],
        });
      }

      const collection = collectionsMap.get(collectionName)!;
      collection.serial_numbers.push({
        sr_no: srNo,
        min_stock: minStock,
        max_stock: maxStock,
        current_stock: currentStock,
        unit: unit as "mtr" | "pcs",
      });
    }

    const collections = Array.from(collectionsMap.values());

    if (collections.length === 0) {
      throw new Error("No valid collections found in CSV file");
    }

    console.log("Parsed collections:", collections);
    return collections;
  };

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        message.error("Please upload a CSV file");
        return;
      }

      const csvContent = await readFileContent(file);
      console.log("CSV Content:", csvContent);

      const collectionsData = parseCSVToCollections(csvContent);
      console.log("Parsed Collections Data:", collectionsData);

      const result = await collectionService.bulkUploadCollections(
        collectionsData
      );
      console.log("Upload Result:", result);

      if (result.successCount > 0 && result.errorCount === 0) {
        message.success(
          `Successfully created ${result.successCount} collections!`
        );
        setTimeout(() => {
          navigate("/collections");
        }, 2000);
      } else if (result.successCount > 0 && result.errorCount > 0) {
        message.warning(
          `Created ${result.successCount} collections with ${result.errorCount} errors. Check console for details.`
        );
        console.log("Errors:", result.errors);
        setTimeout(() => {
          navigate("/collections");
        }, 2000);
      } else {
        message.error(
          "Failed to create any collections. Check console for details."
        );
        console.log("Errors:", result.errors);
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      message.error(
        `Failed to upload CSV: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `collection_name,description,sr_no,min_stock,max_stock,current_stock,unit
Living Room,Elegant and stylish curtains for the living room,LR001,10,50,22,mtr
Living Room,Elegant and stylish curtains for the living room,LR002,12,60,38,mtr
Living Room,Elegant and stylish curtains for the living room,LR003,8,40,15,mtr
Bedroom,Soft and cozy curtains for bedrooms,BR001,10,50,26,mtr
Bedroom,Soft and cozy curtains for bedrooms,BR002,12,55,40,mtr
Bedroom,Soft and cozy curtains for bedrooms,BR003,8,35,20,mtr
Kitchen,Modern and functional kitchen curtains,KT001,5,30,18,mtr
Kitchen,Modern and functional kitchen curtains,KT002,8,40,25,mtr`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "collections_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout
      title={editMode ? "Edit Collection" : "Add Collection"}
      showBack={true}
    >
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4 flex items-center">
            {editMode ? (
              <>
                <Edit className="w-5 h-5 mr-2" />
                Edit Collection
              </>
            ) : (
              <>
                <Package className="w-5 h-5 mr-2" />
                Create New Collection
              </>
            )}
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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
            className="space-y-4"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-gray-300">Collection Name</span>}
                  name="name"
                  rules={[
                    { required: true, message: "Please enter collection name" },
                    { min: 2, message: "Name must be at least 2 characters" },
                  ]}
                >
                  <Input
                    placeholder="Enter collection name"
                    className="bg-gray-700 border-gray-600 text-white"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-gray-300">Description</span>}
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
                    className="bg-gray-700 border-gray-600 text-white"
                    size="large"
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Title level={5} className="!text-white !mb-0">
                  Serial Numbers
                </Title>
                <Button
                  type="dashed"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddSerialNumber}
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
                        className="bg-gray-700 border-gray-600"
                        title={
                          <div className="flex items-center justify-between">
                            <Text className="text-white">
                              Serial Number {name + 1}
                            </Text>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                icon={<Minus className="w-4 h-4" />}
                                onClick={() => {
                                  remove(name);
                                  handleRemoveSerialNumber(name);
                                }}
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
                                <span className="text-gray-300">
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
                                className="bg-gray-600 border-gray-500 text-white"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              {...restField}
                              name={[name, "unit"]}
                              label={
                                <span className="text-gray-300">Unit</span>
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
                                className="bg-gray-600 border-gray-500"
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
                                <span className="text-gray-300">Min Stock</span>
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
                              <Input
                                placeholder="0"
                                className="bg-gray-600 border-gray-500 text-white"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={4}>
                            <Form.Item
                              {...restField}
                              name={[name, "max_stock"]}
                              label={
                                <span className="text-gray-300">Max Stock</span>
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
                              <Input
                                placeholder="100"
                                className="bg-gray-600 border-gray-500 text-white"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={4}>
                            <Form.Item
                              {...restField}
                              name={[name, "current_stock"]}
                              label={
                                <span className="text-gray-300">
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
                                className="bg-gray-600 border-gray-500 text-white"
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                {editMode ? "Update Collection" : "Create Collection"}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Bulk Upload Section */}
        {/* <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4 flex items-center">
            <UploadIcon className="w-5 h-5 mr-2" />
            Bulk Upload Collections
          </Title>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="text-gray-300">
                Upload CSV file to add multiple collections at once
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
              accept=".csv"
              beforeUpload={(file) => {
                handleCSVUpload(file);
                return false; // Prevent default upload
              }}
              showUploadList={false}
              className="bg-gray-700 border-gray-600 hover:border-purple-500"
            >
              <div className="p-6 text-center">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Text className="text-white text-lg block mb-2">
                  Click or drag CSV file to upload
                </Text>
                <Text className="text-gray-400">
                  Supports CSV files with collections data
                </Text>
              </div>
            </Dragger>

            {uploading && (
              <div className="text-center py-4">
                <Text className="text-purple-400">
                  Uploading collections...
                </Text>
              </div>
            )}
          </div>
        </Card> */}
      </div>
    </MainLayout>
  );
};
