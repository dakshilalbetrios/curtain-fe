import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Input,
  Space,
  Modal,
  message,
  Spin,
} from "antd";
import { Package, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collectionsAPI, Collection } from "../../services/api";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const CollectionList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionsAPI.getAll();
      if (!response.error) {
        setCollections(response.data);
      } else {
        console.error("Failed to fetch collections:", response.message);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCollectionClick = (collectionId: number) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleAddCollection = () => {
    navigate("/collections/new");
  };

  const handleEditCollection = (e: React.MouseEvent, collectionId: number) => {
    e.stopPropagation();
    navigate(`/collections/${collectionId}/edit`);
  };

  const handleDeleteCollection = (
    e: React.MouseEvent,
    collectionId: number
  ) => {
    e.stopPropagation();
    setSelectedCollection(collectionId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedCollection) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Collection deleted successfully!");
      setDeleteModalVisible(false);
      setSelectedCollection(null);
      // In real app, this would refresh the data
    } catch (error) {
      message.error("Failed to delete collection");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Collections" showCart={true}>
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Collections" showCart={true}>
      <div className="space-y-4">
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Add Collection
            </Button>
          )}
        </div>

        {/* Collections Grid */}
        <Row gutter={[16, 16]}>
          {filteredCollections.map((collection) => {
            const hasSerialNumbers =
              collection.serial_numbers && collection.serial_numbers.length > 0;
            const lowStockItems =
              collection.serial_numbers?.filter(
                (sr) => sr.current_stock <= sr.min_stock
              ) || [];

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={collection.id}>
                <Card
                  hoverable
                  onClick={() => handleCollectionClick(collection.id)}
                  className="bg-gray-800 border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Title level={5} className="!text-white !mb-1">
                          {collection.name}
                        </Title>
                        <Text className="text-gray-400 text-sm">
                          {collection.description}
                        </Text>
                      </div>
                      {isWholesaler && (
                        <div className="flex space-x-1 ml-2">
                          <Button
                            type="text"
                            size="small"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={(e) =>
                              handleEditCollection(e, collection.id)
                            }
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-1"
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={(e) =>
                              handleDeleteCollection(e, collection.id)
                            }
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hasSerialNumbers ? (
                        <>
                          <Tag color="blue">
                            {collection.serial_numbers?.length} Items
                          </Tag>
                          {lowStockItems.length > 0 && (
                            <Tag color="orange">
                              Low Stock ({lowStockItems.length})
                            </Tag>
                          )}
                        </>
                      ) : (
                        <Tag color="gray">No Items</Tag>
                      )}
                    </div>

                    <Button
                      type="link"
                      className="!text-purple-400 hover:!text-purple-300 !p-0 !h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCollectionClick(collection.id);
                      }}
                    >
                      View Details →
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {filteredCollections.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Title level={4} className="!text-gray-400">
              No collections found
            </Title>
            <Text className="text-gray-500">
              {searchText
                ? "Try adjusting your search criteria"
                : "No collections available"}
            </Text>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={<span className="text-white">Delete Collection</span>}
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={null}
        className="dark-modal"
      >
        <div className="space-y-4">
          <Text className="text-gray-300">
            Are you sure you want to delete this collection? This action cannot
            be undone.
          </Text>
          <div className="flex space-x-2">
            <Button
              onClick={() => setDeleteModalVisible(false)}
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={confirmDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
