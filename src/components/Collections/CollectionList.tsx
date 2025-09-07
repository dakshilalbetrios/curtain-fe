import React, { useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Input,
  Skeleton,
  Modal,
  message,
  Dropdown,
  Upload,
  Form,
  Select,
  Spin,
} from "antd";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  Upload as UploadIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CollectionResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import { useCollections } from "../../hooks/useCollections";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

export const CollectionList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [singleModalVisible, setSingleModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

  const {
    data: collections,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refresh,
    loadMoreRef,
  } = useCollections();

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          if (searchTerm.trim()) {
            setSearchLoading(true);
            try {
              // For search, we'll use the existing search API
              // This is a simplified approach - in a real app you might want to implement search pagination
              const { collectionService } = await import("../../services");
              await collectionService.searchCollections(searchTerm);
              // Note: This will replace the paginated data with search results
              // You might want to implement a separate search state for better UX
            } catch (error) {
              console.error("Failed to search collections:", error);
              message.error("Failed to search collections. Please try again.");
            } finally {
              setSearchLoading(false);
            }
          } else {
            // If search is empty, refresh the paginated data
            refresh();
          }
        }, 500); // 500ms debounce
      };
    })(),
    [refresh]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleCollectionClick = (collectionId: number) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleAddCollection = () => {
    setEditingCollection(null);
    setSingleModalVisible(true);
    form.resetFields();
  };

  const handleEditCollection = async (collectionId: number) => {
    try {
      const { collectionService } = await import("../../services");
      const collection = await collectionService.getCollectionById(
        collectionId
      );
      setEditingCollection(collection);
      setSingleModalVisible(true);
      form.setFieldsValue({
        name: collection.name,
        description: collection.description,
        serial_numbers:
          collection.serial_numbers?.map((sr: any) => ({
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
    }
  };

  const handleSingleCollectionSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      if (editingCollection) {
        // Update existing collection
        const updatePayload: UpdateCollectionRequest = {
          name: values.name,
          description: values.description,
          serial_numbers: values.serial_numbers.map((sr: any) => {
            if (sr.isExisting) {
              // Existing serial number - update action
              return {
                _action: "update" as const,
                id: sr.id,
                min_stock: sr.min_stock,
                max_stock: sr.max_stock,
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
          .filter((sr: any) => sr.isExisting)
          .map((sr: any) => sr.id);

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

        const { collectionService } = await import("../../services");
        await collectionService.updateCollection(
          editingCollection.id,
          updatePayload
        );
        message.success("Collection updated successfully!");
      } else {
        // Create new collection
        const collectionData: CreateCollectionRequest = {
          name: values.name,
          description: values.description,
          serial_numbers: values.serial_numbers || [],
        };

        const { collectionService } = await import("../../services");
        await collectionService.createCollection(collectionData);
        message.success("Collection created successfully!");
      }

      setSingleModalVisible(false);
      setEditingCollection(null);
      form.resetFields();

      // Refresh collections list
      refresh();
    } catch (error) {
      console.error("Failed to save collection:", error);
      message.error(
        editingCollection
          ? "Failed to update collection"
          : "Failed to create collection"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkCollection = () => {
    setBulkModalVisible(true);
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

      const { collectionService } = await import("../../services");
      const result = await collectionService.bulkUploadCollections(
        collectionsData
      );
      console.log("Upload Result:", result);

      if (result.successCount > 0 && result.errorCount === 0) {
        message.success(
          `Successfully created ${result.successCount} collections!`
        );
        setBulkModalVisible(false);
        // Refresh collections list
        refresh();
      } else if (result.successCount > 0 && result.errorCount > 0) {
        message.warning(
          `Created ${result.successCount} collections with ${result.errorCount} errors. Check console for details.`
        );
        console.log("Errors:", result.errors);
        setBulkModalVisible(false);
        // Refresh collections list
        refresh();
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

  const handleDeleteCollection = (
    collectionId: number,
    collectionName: string
  ) => {
    Modal.confirm({
      title: "Delete Collection",
      content: `Are you sure you want to delete "${collectionName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { collectionService } = await import("../../services");
          await collectionService.deleteCollection(collectionId);
          message.success(
            `Collection "${collectionName}" deleted successfully!`
          );

          // Refresh the collections list
          refresh();
        } catch (error) {
          console.error("Delete error:", error);
          message.error(
            `Failed to delete collection "${collectionName}". Please try again.`
          );
        }
      },
    });
  };

  // Skeleton loading component
  const CollectionSkeleton = () => (
    <Col xs={24} sm={12} lg={8} xl={6} className="mb-4">
      <Card className="theme-card h-48">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="Collections" showCart={true}>
      <div className="space-y-2">
        {/* Search and Add Button - Fixed Position */}
        <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 pb-4 pt-4 -mx-4 px-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex items-center space-x-3">
              <Title level={4} className="!theme-text-primary !mb-0">
                Collections
              </Title>
              <Tag color="blue" className="px-2 py-1 text-sm font-medium">
                {total}
              </Tag>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={refresh}
                loading={loading}
                size="small"
                className="theme-button"
              >
                Refresh
              </Button>
            </div>
            <div className="flex gap-4 items-center">
              <AntSearch
                placeholder="Search collections..."
                value={searchText}
                onChange={handleSearchChange}
                className="w-full md:w-80 lg:w-96"
                size="large"
                loading={searchLoading}
              />
              {isWholesaler && (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "single",
                        label: "Single Collection",
                        icon: <Plus className="w-4 h-4" />,
                        onClick: handleAddCollection,
                      },
                      {
                        key: "bulk",
                        label: "Bulk Collection",
                        icon: <UploadIcon className="w-4 h-4" />,
                        onClick: handleBulkCollection,
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="primary"
                    size="large"
                    className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">
                      Add Collection
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        {error && (
          <Card className="theme-card text-center py-8 mb-4">
            <Title level={4} className="!theme-text-red-500 !mb-2">
              Error Loading Collections
            </Title>
            <Text className="theme-text-tertiary mb-4 block">{error}</Text>
            <Button
              onClick={refresh}
              loading={loading}
              className="theme-button"
            >
              Try Again
            </Button>
          </Card>
        )}

        {loading && collections.length === 0 ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <CollectionSkeleton key={index} />
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {collections.length === 0 && !loading ? (
              <Col span={24}>
                <Card className="theme-card text-center py-12">
                  <Package className="w-16 h-16 theme-text-tertiary mx-auto mb-4" />
                  <Title level={4} className="!theme-text-secondary !mb-2">
                    No Collections Found
                  </Title>
                  <Text className="theme-text-tertiary">
                    {searchText
                      ? "Try adjusting your search terms"
                      : "No collections available at the moment"}
                  </Text>
                </Card>
              </Col>
            ) : (
              <>
                {collections.map((collection) => {
                  const lowStockItems =
                    collection.serial_numbers?.filter(
                      (sr) =>
                        parseFloat(sr.current_stock) <= parseFloat(sr.min_stock)
                    ) || [];

                  return (
                    <Col xs={24} sm={12} lg={8} xl={6} key={collection.id}>
                      <Card
                        hoverable
                        onClick={() => handleCollectionClick(collection.id)}
                        className="theme-card-hover cursor-pointer"
                      >
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between">
                              <Title
                                level={5}
                                className="!theme-text-primary !mb-1"
                              >
                                {collection.name}
                              </Title>
                              <Tag color="blue">
                                {collection.serial_numbers?.length} Items
                              </Tag>
                            </div>
                            <Text className="theme-text-secondary text-sm">
                              {collection.description}
                            </Text>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {isWholesaler && lowStockItems.length > 0 && (
                                <Tag color="orange">
                                  Low Stock ({lowStockItems.length})
                                </Tag>
                              )}
                            </div>
                          </div>

                          {user?.role === "ADMIN" && (
                            <div className="flex items-center justify-between space-x-2 pt-2 border-t theme-border-secondary">
                              <Button
                                type="link"
                                icon={<Edit className="w-4 h-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCollection(collection.id);
                                }}
                                className="!text-purple-400 hover:!text-purple-300 !p-0 !h-auto flex items-center gap-1"
                              >
                                Edit
                              </Button>
                              <Button
                                type="link"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCollection(
                                    collection.id,
                                    collection.name
                                  );
                                }}
                                className="!text-red-400 hover:!text-red-300 !p-0 !h-auto flex items-center gap-1"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <Col span={24} className="text-center py-8">
                    <div ref={loadMoreRef}>
                      {loadingMore ? (
                        <Spin size="large" />
                      ) : (
                        <Button
                          onClick={() => {
                            // This will be triggered by intersection observer
                          }}
                          className="theme-button"
                        >
                          Load More Collections
                        </Button>
                      )}
                    </div>
                  </Col>
                )}

                {!hasMore && collections.length > 0 && (
                  <Col span={24} className="text-center py-8">
                    <Text className="theme-text-tertiary">
                      You've reached the end of the collections list
                    </Text>
                  </Col>
                )}
              </>
            )}
          </Row>
        )}

        {/* Bulk Upload Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <UploadIcon className="w-5 h-5 mr-2 text-purple-400" />
              <span className="theme-text-primary">
                Bulk Upload Collections
              </span>
            </div>
          }
          open={bulkModalVisible}
          onCancel={() => setBulkModalVisible(false)}
          footer={null}
          width={600}
          className="bulk-upload-modal"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="theme-text-secondary">
                Upload CSV file to add multiple collections at once
              </Text>
              <Button
                icon={<Download className="w-4 h-4" />}
                onClick={downloadTemplate}
                className="theme-button"
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
              className="theme-input hover:border-purple-500"
            >
              <div className="p-6 text-center">
                <UploadIcon className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
                <Text className="theme-text-primary text-lg block mb-2">
                  Click or drag CSV file to upload
                </Text>
                <Text className="theme-text-secondary">
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

            <div className="mt-4 p-3 theme-bg-tertiary rounded-lg">
              <Text className="theme-text-secondary text-sm">
                <strong>CSV Format Requirements:</strong>
              </Text>
              <ul className="theme-text-tertiary text-xs mt-2 space-y-1">
                <li>
                  • Required columns: collection_name, description, sr_no,
                  min_stock, max_stock, current_stock, unit
                </li>
                <li>• Unit must be either "mtr" or "pcs"</li>
                <li>• Stock values must be numeric</li>
                <li>• Download template for reference</li>
              </ul>
            </div>
          </div>
        </Modal>

        {/* Single Collection Modal */}
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
          open={singleModalVisible}
          onCancel={() => {
            setSingleModalVisible(false);
            setEditingCollection(null);
            form.resetFields();
          }}
          footer={null}
          width={900}
          className="single-collection-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSingleCollectionSubmit}
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
                    <span className="theme-text-secondary">
                      Collection Name
                    </span>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Please enter collection name" },
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
                  label={
                    <span className="theme-text-secondary">Description</span>
                  }
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
                                <span className="theme-text-secondary">
                                  Unit
                                </span>
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
                              <Input
                                placeholder="100"
                                className="theme-input"
                              />
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
                <Button
                  onClick={() => {
                    setSingleModalVisible(false);
                    setEditingCollection(null);
                    form.resetFields();
                  }}
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
                  {editingCollection
                    ? "Update Collection"
                    : "Create Collection"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
