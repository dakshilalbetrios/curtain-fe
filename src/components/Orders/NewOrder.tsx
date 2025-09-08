import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Select,
  InputNumber,
  message,
  Skeleton,
  Row,
  Col,
  Tag,
  Divider,
  Empty,
} from "antd";
import { ShoppingCart, Package, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { userService } from "../../services";
import { collectionService, CollectionResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Option } = Select;

interface AccessibleCollection extends CollectionResponse {
  accessStatus: "ACTIVE";
}

export const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, getTotalItems } = useCart();
  const [accessibleCollections, setAccessibleCollections] = useState<
    AccessibleCollection[]
  >([]);
  const [selectedCollection, setSelectedCollection] =
    useState<AccessibleCollection | null>(null);
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<
    number | null
  >(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantityError, setQuantityError] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      loadAccessibleCollections();
    }
  }, [user?.id]);

  const loadAccessibleCollections = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get user's collection access and all collections in parallel
      const [accessData, allCollections] = await Promise.all([
        userService.getUserCollectionAccess(user.id),
        collectionService.getAllCollections(),
      ]);

      // Filter collections that user has ACTIVE access to
      const activeCollectionIds = accessData
        .filter((access) => access.status === "ACTIVE")
        .map((access) => access.collection_id);

      const accessible = allCollections
        .filter((collection) => activeCollectionIds.includes(collection.id))
        .map((collection) => ({
          ...collection,
          accessStatus: "ACTIVE" as const,
        }));

      setAccessibleCollections(accessible);
    } catch (error) {
      console.error("Failed to load accessible collections:", error);
      message.error("Failed to load collections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionChange = (collectionId: number) => {
    const collection = accessibleCollections.find((c) => c.id === collectionId);
    setSelectedCollection(collection || null);
    setSelectedSerialNumber(null);
    setQuantity(1);
    setQuantityError("");
  };

  const handleSerialNumberChange = (serialNumberId: number) => {
    setSelectedSerialNumber(serialNumberId);
    setQuantity(1);
    setQuantityError("");
  };

  const validateQuantity = (value: number | null) => {
    if (!selectedCollection || !selectedSerialNumber) return;

    const serialNumber = selectedCollection.serial_numbers.find(
      (sr) => sr.id === selectedSerialNumber
    );

    if (!serialNumber) return;

    const availableStock = parseFloat(serialNumber.current_stock);

    if (value && value > availableStock) {
      setQuantityError(
        `Quantity cannot exceed available stock (${availableStock} ${serialNumber.unit})`
      );
    } else {
      setQuantityError("");
    }
  };

  const handleQuantityChange = (value: number | null) => {
    const newQuantity = value || 1;
    setQuantity(newQuantity);
    validateQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedCollection || !selectedSerialNumber) {
      message.warning("Please select a collection and serial number");
      return;
    }

    const serialNumber = selectedCollection.serial_numbers.find(
      (sr) => sr.id === selectedSerialNumber
    );
    if (!serialNumber) {
      message.error("Selected serial number not found");
      return;
    }

    if (quantity <= 0) {
      message.warning("Please enter a valid quantity");
      return;
    }

    if (quantity > parseFloat(serialNumber.current_stock)) {
      message.warning(
        `Quantity cannot exceed available stock (${serialNumber.current_stock} ${serialNumber.unit})`
      );
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        collection_sr_no_id: serialNumber.id,
        sr_no: serialNumber.sr_no,
        collection_name: selectedCollection.name,
        quantity: quantity,
        unit: serialNumber.unit,
        available_stock: parseFloat(serialNumber.current_stock),
      };

      addToCart(cartItem);
      message.success(
        `Added ${quantity} ${serialNumber.unit} of ${serialNumber.sr_no} to cart`
      );

      // Reset form
      setSelectedCollection(null);
      setSelectedSerialNumber(null);
      setQuantity(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      message.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="New Order" showCart={true}>
        <div className="space-y-6">
          <Card className="theme-card">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="New Order" showCart={true}>
      <div className="space-y-6">
        {/* Header */}
        <Card className="theme-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <Title level={4} className="!theme-text-primary !mb-1">
                  Create New Order
                </Title>
                <Text className="theme-text-secondary">
                  Select collections and items to add to your cart
                </Text>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="blue" className="px-3 py-1">
                {getTotalItems()} items in cart
              </Tag>
            </div>
          </div>
        </Card>

        {/* Order Form */}
        <Card className="theme-card">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-400" />
              <Title level={5} className="!theme-text-primary !mb-0">
                Select Collection
              </Title>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text className="theme-text-secondary font-medium">
                    Collection
                  </Text>
                  <Select
                    placeholder="Select a collection"
                    value={selectedCollection?.id}
                    onChange={handleCollectionChange}
                    className="w-full"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {accessibleCollections.map((collection) => (
                      <Option key={collection.id} value={collection.id}>
                        {collection.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              {selectedCollection && (
                <Col xs={24} md={12}>
                  <div className="space-y-2">
                    <Text className="theme-text-secondary font-medium">
                      Serial Number
                    </Text>
                    <Select
                      placeholder="Select serial number"
                      value={selectedSerialNumber}
                      onChange={handleSerialNumberChange}
                      className="w-full"
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {selectedCollection.serial_numbers?.map(
                        (serialNumber) => (
                          <Option key={serialNumber.id} value={serialNumber.id}>
                            {serialNumber.sr_no}
                          </Option>
                        )
                      )}
                    </Select>
                  </div>
                </Col>
              )}
            </Row>

            {selectedSerialNumber && (
              <>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div className="space-y-2">
                      <Text className="theme-text-secondary font-medium">
                        Quantity
                      </Text>
                      <InputNumber
                        min={1}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-full"
                        size="large"
                        status={quantityError ? "error" : ""}
                        addonAfter={
                          selectedCollection?.serial_numbers?.find(
                            (sr) => sr.id === selectedSerialNumber
                          )?.unit
                        }
                      />
                      {quantityError && (
                        <Text type="danger" className="text-sm">
                          {quantityError}
                        </Text>
                      )}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="space-y-2">
                      <Text className="theme-text-secondary font-medium">
                        Action
                      </Text>
                      <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleAddToCart}
                        loading={addingToCart}
                        size="large"
                        className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
                        disabled={
                          !selectedCollection ||
                          !selectedSerialNumber ||
                          quantity <= 0 ||
                          !!quantityError
                        }
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Card>

        {/* No Collections Available */}
        {accessibleCollections.length === 0 && !loading && (
          <Card className="theme-card">
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
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
