import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  Upload as UploadIcon,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  collectionService,
  CollectionResponse,
  CreateCollectionRequest,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

const { Dragger } = Upload;

export const CollectionList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

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
              const data = await collectionService.searchCollections(
                searchTerm
              );
              setCollections(data);
            } catch (error) {
              console.error("Failed to search collections:", error);
              message.error("Failed to search collections. Please try again.");
            } finally {
              setSearchLoading(false);
            }
          } else {
            // If search is empty, fetch all collections
            setLoading(true);
            try {
              const data = await collectionService.getAllCollections();
              setCollections(data);
            } catch (error) {
              console.error("Failed to fetch collections:", error);
            } finally {
              setLoading(false);
            }
          }
        }, 500); // 500ms debounce
      };
    })(),
    []
  );

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionService.getAllCollections();
        setCollections(data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

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
    navigate("/collections/add");
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
        const updatedCollections = await collectionService.getAllCollections();
        setCollections(updatedCollections);
      } else if (result.successCount > 0 && result.errorCount > 0) {
        message.warning(
          `Created ${result.successCount} collections with ${result.errorCount} errors. Check console for details.`
        );
        console.log("Errors:", result.errors);
        setBulkModalVisible(false);
        // Refresh collections list
        const updatedCollections = await collectionService.getAllCollections();
        setCollections(updatedCollections);
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

  const handleEditCollection = (collectionId: number) => {
    navigate(`/collections/edit/${collectionId}`);
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
          await collectionService.deleteCollection(collectionId);
          message.success(
            `Collection "${collectionName}" deleted successfully!`
          );

          // Refresh the collections list
          const updatedCollections =
            await collectionService.getAllCollections();
          setCollections(updatedCollections);
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
      <Card className="bg-gray-800 border-gray-700 h-48">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="Collections" showCart={true}>
      <div className="space-y-2">
        {/* Search and Add Button - Fixed Position */}
        <div className="sticky top-0 z-50 bg-gray-900 backdrop-blur-sm border-b border-gray-700/50 pb-4 pt-4 -mx-4 px-4">
          <div className="flex gap-4 items-center justify-end">
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
                  <span className="hidden sm:inline ml-2">Add Collection</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Collections Grid */}
        {loading || searchLoading ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <CollectionSkeleton key={index} />
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {collections.length === 0 ? (
              <Col span={24}>
                <Card className="bg-gray-800 border-gray-700 text-center py-12">
                  <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <Title level={4} className="!text-gray-400 !mb-2">
                    No Collections Found
                  </Title>
                  <Text className="text-gray-500">
                    {searchText
                      ? "Try adjusting your search terms"
                      : "No collections available at the moment"}
                  </Text>
                </Card>
              </Col>
            ) : (
              collections.map((collection) => {
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
                      className="bg-gray-800 border-gray-700 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <Title level={5} className="!text-white !mb-1">
                              {collection.name}
                            </Title>
                            <Tag color="blue">
                              {collection.serial_numbers?.length} Items
                            </Tag>
                          </div>
                          <Text className="text-gray-400 text-sm">
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
                          <div className="flex items-center justify-between space-x-2 pt-2 border-t border-gray-700">
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
              })
            )}
          </Row>
        )}

        {/* Bulk Upload Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <UploadIcon className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-white">Bulk Upload Collections</span>
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

            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <Text className="text-gray-300 text-sm">
                <strong>CSV Format Requirements:</strong>
              </Text>
              <ul className="text-gray-400 text-xs mt-2 space-y-1">
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
      </div>
    </MainLayout>
  );
};
