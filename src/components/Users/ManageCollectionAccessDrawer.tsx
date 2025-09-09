import React, { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Card,
  Typography,
  Button,
  message,
  Skeleton,
  Tag,
  Input,
  Divider,
} from "antd";
import { User, Package } from "lucide-react";
import { userService, UserResponse } from "../../services";
import { collectionService, CollectionResponse } from "../../services";
import {
  USER_ROLE,
  ROLE_COLORS,
  USER_STATUS,
  STATUS_COLORS,
} from "../../constants";

const { Title, Text } = Typography;
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
}

export const ManageCollectionAccessDrawer: React.FC<
  ManageCollectionAccessDrawerProps
> = ({ visible, onClose, userId }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [collectionAccess, setCollectionAccess] = useState<
    CollectionAccessStatus[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [updatingCollection, setUpdatingCollection] = useState<number | null>(
    null
  );
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
            accessMap.get(collection.id) === USER_STATUS.ACTIVE,
        }));

      setCollectionAccess(collectionAccessStatus);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionToggle = async (collectionId: number) => {
    if (!userId) return;

    const currentAccess = collectionAccess.find(
      (item) => item.collectionId === collectionId
    );
    const isCurrentlyActive = currentAccess?.isSelected || false;

    setUpdatingCollection(collectionId);

    try {
      if (isCurrentlyActive) {
        // Currently active, make it inactive
        await userService.updateCollectionAccess(userId, {
          updates: [{ collectionId, status: "INACTIVE" }],
        });

        setCollectionAccess((prev) =>
          prev.map((item) =>
            item.collectionId === collectionId
              ? { ...item, isSelected: false, status: "INACTIVE" }
              : item
          )
        );

        message.success("Collection access deactivated successfully!");
      } else {
        // Currently inactive, make it active
        await userService.addCollectionAccess(userId, {
          collectionIds: [collectionId],
          status: USER_STATUS.ACTIVE,
        });

        setCollectionAccess((prev) =>
          prev.map((item) =>
            item.collectionId === collectionId
              ? { ...item, isSelected: true, status: USER_STATUS.ACTIVE }
              : item
          )
        );

        message.success("Collection access activated successfully!");
      }
    } catch (error) {
      console.error("Failed to update collection access:", error);
      message.error("Failed to update collection access. Please try again.");
    } finally {
      setUpdatingCollection(null);
    }
  };

  const renderCollectionItem = (collection: CollectionResponse) => {
    const access = collectionAccess.find(
      (item) => item.collectionId === collection.id
    );
    const isActive = access?.isSelected || false;
    const isLoading = updatingCollection === collection.id;

    return (
      <div
        key={collection.id}
        className="flex items-center justify-between p-4 theme-bg-tertiary rounded-lg border theme-border-primary hover:theme-border-secondary transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center space-x-2">
              <Title level={5} className="!theme-text-primary !mb-1">
                {collection.name}
              </Title>
              <div>
                <Tag color="blue">
                  {collection.serial_numbers?.length || 0} Items
                </Tag>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end space-y-1">
            <Button
              type={isActive ? "default" : "primary"}
              size="small"
              loading={isLoading}
              onClick={() => handleCollectionToggle(collection.id)}
              className={
                isActive
                  ? "!border-red-500 !text-red-500 hover:!bg-red-50 hover:!border-red-600 hover:!text-red-600 focus:!border-red-600 focus:!text-red-600"
                  : "!bg-purple-600 hover:!bg-purple-700 !border-purple-600 !text-white hover:!border-purple-700 focus:!bg-purple-700 focus:!border-purple-700"
              }
            >
              {isActive ? "Remove Access" : "Give Access"}
            </Button>
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
      >
        <div className="space-y-3">
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
                    {user.shop_name} +{user.mobile_no}
                  </Text>
                  <div className="mt-1">
                    <Tag color={STATUS_COLORS[user.status]}>{user.status}</Tag>
                    <Tag color={ROLE_COLORS[user.role]}>{user.role}</Tag>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Sticky Search */}
          <div className="sticky -top-6 z-10 bg-white dark:bg-gray-900 pt-4 pb-4 -mx-6 px-6">
            <div className="space-y-2">
              <AntSearch
                placeholder="Search collections by name..."
                onChange={handleSearchChange}
                className="w-full"
                size="large"
                allowClear
              />
            </div>
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
    </>
  );
};
