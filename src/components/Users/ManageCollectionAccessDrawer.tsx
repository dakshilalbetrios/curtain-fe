import React, { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Card,
  Typography,
  Button,
  Checkbox,
  Select,
  Modal,
  message,
  Skeleton,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Divider,
} from "antd";
import { Save, User, Package, AlertCircle, Search, X } from "lucide-react";
import { userService, UserResponse } from "../../services";
import { collectionService, CollectionResponse } from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search: AntSearch } = Input;

interface CollectionAccessStatus {
  collectionId: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED";
  isSelected: boolean;
}

interface ManageCollectionAccessDrawerProps {
  visible: boolean;
  onClose: () => void;
  userId: number | null;
  onSuccess?: () => void;
}

export const ManageCollectionAccessDrawer: React.FC<
  ManageCollectionAccessDrawerProps
> = ({ visible, onClose, userId, onSuccess }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [collectionAccess, setCollectionAccess] = useState<
    CollectionAccessStatus[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "INACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED"
  >("INACTIVE");
  const [searchText, setSearchText] = useState("");

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setSearchText(searchTerm);
        }, 300);
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Filter collections based on search
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Separate active and inactive collections
  const activeCollections = filteredCollections.filter((collection) => {
    const access = collectionAccess.find(
      (item) => item.collectionId === collection.id
    );
    return access?.isSelected || false;
  });

  const inactiveCollections = filteredCollections.filter((collection) => {
    const access = collectionAccess.find(
      (item) => item.collectionId === collection.id
    );
    return !access?.isSelected;
  });

  useEffect(() => {
    if (visible && userId) {
      loadData(userId);
    } else {
      // Reset state when drawer closes
      setUser(null);
      setCollections([]);
      setCollectionAccess([]);
      setSearchText("");
    }
  }, [visible, userId]);

  const loadData = async (userId: number) => {
    setLoading(true);
    try {
      // Load user data and collections in parallel
      const [userData, collectionsData, accessData] = await Promise.all([
        userService.getUserById(userId),
        collectionService.getAllCollections(),
        userService.getUserCollectionAccess(userId),
      ]);

      setUser(userData);
      setCollections(collectionsData);

      // Create collection access status array
      const accessMap = new Map(
        accessData.map((access) => [access.collection_id, access.status])
      );

      const collectionAccessStatus: CollectionAccessStatus[] =
        collectionsData.map((collection) => ({
          collectionId: collection.id,
          status: accessMap.get(collection.id) || "INACTIVE",
          isSelected:
            accessMap.has(collection.id) &&
            accessMap.get(collection.id) === "ACTIVE",
        }));

      setCollectionAccess(collectionAccessStatus);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionToggle = (collectionId: number, checked: boolean) => {
    if (checked) {
      // If checking, set to ACTIVE
      setCollectionAccess((prev) =>
        prev.map((item) =>
          item.collectionId === collectionId
            ? { ...item, isSelected: true, status: "ACTIVE" }
            : item
        )
      );
    } else {
      // If unchecking, show status selection modal
      setSelectedCollectionId(collectionId);
      setShowStatusModal(true);
    }
  };

  const handleStatusConfirm = () => {
    if (selectedCollectionId) {
      setCollectionAccess((prev) =>
        prev.map((item) =>
          item.collectionId === selectedCollectionId
            ? { ...item, isSelected: false, status: selectedStatus }
            : item
        )
      );
      setShowStatusModal(false);
      setSelectedCollectionId(null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Prepare updates for collections that are not ACTIVE
      const updates = collectionAccess
        .filter((item) => !item.isSelected && item.status !== "INACTIVE")
        .map((item) => ({
          collectionId: item.collectionId,
          status: item.status,
        }));

      // Prepare new collections to add (ACTIVE ones that weren't previously active)
      const newCollections = collectionAccess
        .filter((item) => item.isSelected)
        .map((item) => item.collectionId);

      // Execute updates and additions
      const promises = [];

      if (updates.length > 0) {
        promises.push(userService.updateCollectionAccess(userId, { updates }));
      }

      if (newCollections.length > 0) {
        promises.push(
          userService.addCollectionAccess(userId, {
            collectionIds: newCollections,
            status: "ACTIVE",
          })
        );
      }

      await Promise.all(promises);

      message.success("Collection access updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save collection access:", error);
      message.error("Failed to save collection access. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "red";
      case "PENDING":
        return "orange";
      case "SUSPENDED":
        return "purple";
      case "EXPIRED":
        return "gray";
      default:
        return "default";
    }
  };

  const renderCollectionItem = (collection: CollectionResponse) => {
    const access = collectionAccess.find(
      (item) => item.collectionId === collection.id
    );

    return (
      <div
        key={collection.id}
        className="flex items-center justify-between p-4 theme-bg-tertiary rounded-lg border theme-border-primary hover:theme-border-secondary transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={access?.isSelected || false}
              onChange={(e) =>
                handleCollectionToggle(collection.id, e.target.checked)
              }
              className="theme-text-primary"
            />
            <div>
              <Title level={5} className="!theme-text-primary !mb-1">
                {collection.name}
              </Title>
              <Text className="theme-text-secondary text-sm">
                {collection.description}
              </Text>
              <div className="mt-2">
                <Tag color="blue">
                  {collection.serial_numbers?.length || 0} Items
                </Tag>
                {access && !access.isSelected && (
                  <Tag color={getStatusColor(access.status)} className="ml-2">
                    {access.status}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="theme-text-primary">
                Manage Collection Access
              </span>
            </div>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={600}
        className="collection-access-drawer"
        footer={
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} className="theme-button">
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* User Info */}
          {loading ? (
            <Card className="theme-card">
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ) : user ? (
            <Card className="theme-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Title level={4} className="!theme-text-primary !mb-1">
                    {user.name}
                  </Title>
                  <Text className="theme-text-secondary">
                    {user.shop_name} • {user.mobile_no}
                  </Text>
                  <div className="mt-1">
                    <Tag color={user.status === "ACTIVE" ? "green" : "red"}>
                      {user.status}
                    </Tag>
                    <Tag color={user.role === "ADMIN" ? "green" : "blue"}>
                      {user.role}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Search */}
          <div className="space-y-2">
            <Text className="theme-text-secondary font-medium">
              Search Collections
            </Text>
            <AntSearch
              placeholder="Search collections by name..."
              onChange={handleSearchChange}
              className="w-full"
              size="large"
              prefix={<Search className="w-4 h-4 theme-text-tertiary" />}
            />
          </div>

          {/* Active Collections Section */}
          {activeCollections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Title level={5} className="!theme-text-primary !mb-0">
                  Active Collections ({activeCollections.length})
                </Title>
              </div>
              <div className="space-y-3">
                {activeCollections.map(renderCollectionItem)}
              </div>
            </div>
          )}

          {/* Divider between active and inactive */}
          {activeCollections.length > 0 && inactiveCollections.length > 0 && (
            <Divider className="!my-6" />
          )}

          {/* Inactive Collections Section */}
          {inactiveCollections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <Title level={5} className="!theme-text-primary !mb-0">
                  Inactive Collections ({inactiveCollections.length})
                </Title>
              </div>
              <div className="space-y-3">
                {inactiveCollections.map(renderCollectionItem)}
              </div>
            </div>
          )}

          {/* No collections found */}
          {filteredCollections.length === 0 && !loading && (
            <Card className="theme-card text-center py-8">
              <Package className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
              <Title level={5} className="!theme-text-secondary !mb-2">
                {searchText
                  ? "No Collections Found"
                  : "No Collections Available"}
              </Title>
              <Text className="theme-text-tertiary">
                {searchText
                  ? "Try adjusting your search terms"
                  : "No collections are available for this user"}
              </Text>
            </Card>
          )}

          {/* Loading state */}
          {loading && (
            <Card className="theme-card">
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          )}
        </div>
      </Drawer>

      {/* Status Selection Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="theme-text-primary">
              Select Status for Unselected Collection
            </span>
          </div>
        }
        open={showStatusModal}
        onCancel={() => setShowStatusModal(false)}
        onOk={handleStatusConfirm}
        okText="Confirm"
        cancelText="Cancel"
        className="collection-status-modal"
      >
        <div className="py-4">
          <Text className="theme-text-secondary mb-4 block">
            Please select the status for this collection when it's not active:
          </Text>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-full theme-input"
            size="large"
          >
            <Option value="INACTIVE">Inactive</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="SUSPENDED">Suspended</Option>
            <Option value="EXPIRED">Expired</Option>
          </Select>
        </div>
      </Modal>
    </>
  );
};
