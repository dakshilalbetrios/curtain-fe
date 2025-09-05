import React, { useState, useEffect } from "react";
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
} from "antd";
import { Package, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collectionService, CollectionResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const CollectionList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

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

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCollectionClick = (collectionId: number) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleAddCollection = () => {
    navigate("/collections/add");
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
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <AntSearch
              placeholder="Search collections..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
              size="large"
              prefix={<Search className="w-4 h-4 text-gray-400" />}
            />
            {isWholesaler && (
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddCollection}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-purple-600 whitespace-nowrap w-full sm:w-auto"
              >
                Add Collection
              </Button>
            )}
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <CollectionSkeleton key={index} />
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredCollections.length === 0 ? (
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
              filteredCollections.map((collection) => {
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
                      className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105"
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
                          {collection.serial_numbers &&
                            collection.serial_numbers.length > 0 && (
                              <Button
                                type="link"
                                className="!text-purple-400 !p-0 !h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCollectionClick(collection.id);
                                }}
                              >
                                View Details →
                              </Button>
                            )}
                        </div>

                        {user?.role === "ADMIN" && (
                          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-700">
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
      </div>
    </MainLayout>
  );
};
