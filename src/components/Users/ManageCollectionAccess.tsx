import React, { useState, useEffect } from "react";
import {
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
} from "antd";
import { ArrowLeft, Save, User, Package, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { userService, UserResponse } from "../../services";
import { collectionService, CollectionResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Option } = Select;

interface CollectionAccessStatus {
  collectionId: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED";
  isSelected: boolean;
}

export const ManageCollectionAccess: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [collectionAccess, setCollectionAccess] = useState<
    CollectionAccessStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "INACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED"
  >("INACTIVE");

  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    if (userId) {
      loadData(parseInt(userId));
    }
  }, [userId]);

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
      navigate("/users");
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
        promises.push(
          userService.updateCollectionAccess(parseInt(userId), { updates })
        );
      }

      if (newCollections.length > 0) {
        promises.push(
          userService.addCollectionAccess(parseInt(userId), {
            collectionIds: newCollections,
            status: "ACTIVE",
          })
        );
      }

      await Promise.all(promises);

      message.success("Collection access updated successfully!");
      navigate("/users");
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

  if (loading) {
    return (
      <MainLayout title="Manage Collection Access" showBack={true}>
        <Card className="theme-card">
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Manage Collection Access" showBack={true}>
      <div className="space-y-6">
        {/* User Info */}
        <Card className="theme-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title level={4} className="!theme-text-primary !mb-1">
                {user?.name}
              </Title>
              <Text className="theme-text-secondary">
                {user?.shop_name} • {user?.mobile_no}
              </Text>
              <div className="mt-1">
                <Tag color={user?.status === "ACTIVE" ? "green" : "red"}>
                  {user?.status}
                </Tag>
                <Tag color={user?.role === "ADMIN" ? "green" : "blue"}>
                  {user?.role}
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        {/* Collection Access Management */}
        <Card className="theme-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-400" />
              <Title level={4} className="!theme-text-primary !mb-0">
                Collection Access
              </Title>
            </div>
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

          <div className="space-y-4">
            {collections.map((collection) => {
              const access = collectionAccess.find(
                (item) => item.collectionId === collection.id
              );

              return (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 theme-bg-tertiary rounded-lg border theme-border-primary"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={access?.isSelected || false}
                        onChange={(e) =>
                          handleCollectionToggle(
                            collection.id,
                            e.target.checked
                          )
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
                            <Tag
                              color={getStatusColor(access.status)}
                              className="ml-2"
                            >
                              {access.status}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

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
      </div>
    </MainLayout>
  );
};
