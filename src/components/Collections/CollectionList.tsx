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
  Form,
  Spin,
} from "antd";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  RefreshCw,
  UploadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLE } from "../../constants";
import {
  CollectionResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import { useCollections } from "../../hooks/useCollections";
import { BulkUploadModal } from "./BulkUploadModal";
import { SingleCollectionModal } from "./SingleCollectionModal";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const CollectionList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [singleModalVisible, setSingleModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler =
    user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.SALES;

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setSearchText(searchTerm);
        }, 500); // 500ms debounce
      };
    })(),
    []
  );

  const {
    data: collections,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refresh,
    loadMoreRef,
  } = useCollections(searchText);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

      const collectionsData = parseCSVToCollections(csvContent);

      const { collectionService } = await import("../../services");
      const result = await collectionService.bulkUploadCollections(
        collectionsData
      );

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

        setBulkModalVisible(false);
        // Refresh collections list
        refresh();
      } else {
        message.error(
          "Failed to create any collections. Check console for details."
        );
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
    <Col xs={24} sm={12} lg={8} xl={8} xxl={6} className="mb-4">
      <Card className="theme-card h-48">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="" showCart={true}>
      <div className="flex flex-col h-full min-h-0 max-h-full">
        {/* Fixed Header Section */}
        <div className="sticky top-0 z-50 theme-bg-primary backdrop-blur-sm border-b theme-border-primary/50 pb-4 -mx-4 px-4 flex-shrink-0">
          <div className="space-y-4">
            {/* Main Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Section - Title and Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <Title
                      level={3}
                      className="!theme-text-primary !mb-0 !text-2xl"
                    >
                      Collections
                    </Title>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag color="blue" className="px-3 py-1 text-sm font-medium">
                    {total}
                  </Tag>
                  <Button
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={refresh}
                    loading={loading}
                    size="small"
                    className="theme-button border theme-border-primary hover:theme-bg-tertiary"
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Right Section - Search and Actions */}
              <div className="flex flex-row gap-3 items-center">
                <AntSearch
                  placeholder="Search collections by name..."
                  onChange={handleSearchChange}
                  className="flex-1 min-w-0"
                  size="large"
                  allowClear
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
                      className="bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
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
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 min-h-0 max-h-full -mr-4 pr-4 pb-16 lg:pb-6">
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
              {[...Array(20)].map((_, index) => (
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
                          parseFloat(sr.current_stock) <=
                          parseFloat(sr.min_stock)
                      ) || [];

                    return (
                      <Col
                        xs={24}
                        sm={12}
                        lg={8}
                        xl={8}
                        xxl={6}
                        key={collection.id}
                      >
                        <Card
                          hoverable
                          onClick={() => handleCollectionClick(collection.id)}
                          className="theme-card-hover cursor-pointer transition-all duration-300 hover:border-purple-500 h-full"
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

                            {user?.role === USER_ROLE.ADMIN && (
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
          <BulkUploadModal
            visible={bulkModalVisible}
            onClose={() => setBulkModalVisible(false)}
            onUpload={handleCSVUpload}
            uploading={uploading}
            onDownloadTemplate={downloadTemplate}
          />

          {/* Single Collection Modal */}
          <SingleCollectionModal
            visible={singleModalVisible}
            onClose={() => {
              setSingleModalVisible(false);
              setEditingCollection(null);
              form.resetFields();
            }}
            onSubmit={handleSingleCollectionSubmit}
            editingCollection={editingCollection}
            form={form}
            formLoading={formLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};
