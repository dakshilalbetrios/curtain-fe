import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  InputNumber,
  Tag,
  message,
  Space,
  Progress,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Package, Plus, Minus, ShoppingCart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { mockCollections, mockCollectionSrNos } from "../../data/mockData";
import { MainLayout } from "../Layout/MainLayout";
import { CollectionSrNo } from "../../types";

const { Title, Text } = Typography;

export const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const collectionId = parseInt(id || "0");
  const collection = mockCollections.find((c) => c.id === collectionId);
  const serialNumbers = mockCollectionSrNos.filter(
    (sr) => sr.collection_id === collectionId
  );

  const isRetailer = user?.role === "CUSTOMER";
  const isWholesaler = user?.role === "ADMIN" || user?.role === "SALES";

  if (!collection) {
    return (
      <MainLayout title="Collection Not Found" showBack={true}>
        <div className="text-center py-8">
          <Title level={3} className="!text-gray-400">
            Collection Not Found
          </Title>
        </div>
      </MainLayout>
    );
  }

  const handleQuantityChange = (srNoId: number, value: number | null) => {
    setQuantities((prev) => ({
      ...prev,
      [srNoId]: value || 0,
    }));
  };

  const handleAddToCart = (srNo: CollectionSrNo) => {
    const quantity = quantities[srNo.id] || 0;
    if (quantity <= 0) {
      message.error("Please enter a valid quantity");
      return;
    }
    if (quantity > srNo.current_stock) {
      message.error("Quantity exceeds available stock");
      return;
    }

    addToCart({
      collection_sr_no_id: srNo.id,
      sr_no: srNo.sr_no,
      collection_name: collection.name,
      quantity: quantity,
      unit: srNo.unit,
      available_stock: srNo.current_stock,
    });

    message.success("Added to cart successfully");
    setQuantities((prev) => ({ ...prev, [srNo.id]: 0 }));
  };

  const getStockStatus = (srNo: CollectionSrNo) => {
    if (srNo.current_stock <= srNo.min_stock) {
      return { color: "orange", text: "Low Stock", level: "low" };
    }
    if (srNo.current_stock >= srNo.max_stock * 0.7) {
      return { color: "green", text: "High Stock", level: "high" };
    }
    return { color: "blue", text: "Medium Stock", level: "medium" };
  };

  const getStockPercentage = (srNo: CollectionSrNo) => {
    return Math.round((srNo.current_stock / srNo.max_stock) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 30) return "#f59e0b"; // orange
    if (percentage >= 70) return "#10b981"; // green
    return "#3b82f6"; // blue
  };

  return (
    <MainLayout title={collection.name} showBack={true} showCart={true}>
      <div className="space-y-6">
        {/* Collection Header */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <Title level={3} className="!text-white !mb-2">
                {collection.name}
              </Title>
              <Text className="text-gray-400">{collection.description}</Text>
              <div className="mt-2">
                <Tag color="blue">{serialNumbers.length} Items Available</Tag>
              </div>
            </div>
          </div>
        </Card>

        {/* Serial Numbers */}
        <div>
          <Title level={4} className="!text-white !mb-4">
            Available Items
          </Title>

          {serialNumbers.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Title level={4} className="!text-gray-400">
                No items available
              </Title>
              <Text className="text-gray-500">
                This collection doesn't have any items yet
              </Text>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {serialNumbers.map((srNo) => {
                const stockStatus = getStockStatus(srNo);
                const currentQuantity = quantities[srNo.id] || 0;
                const stockPercentage = getStockPercentage(srNo);

                return (
                  <Col xs={24} sm={12} lg={8} key={srNo.id}>
                    <Card className="bg-gray-800 border-gray-700">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Title level={5} className="!text-white !mb-1">
                              {srNo.sr_no}
                            </Title>
                            <Text className="text-gray-400 text-sm">
                              Unit: {srNo.unit.toUpperCase()}
                            </Text>
                          </div>
                          <Tag color={stockStatus.color}>
                            {stockStatus.text}
                          </Tag>
                        </div>

                        {isWholesaler ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-2">
                                <Text className="text-gray-300">
                                  Stock Level
                                </Text>
                                <Text className="text-white font-medium">
                                  {srNo.current_stock}/{srNo.max_stock}{" "}
                                  {srNo.unit}
                                </Text>
                              </div>
                              <Progress
                                percent={stockPercentage}
                                strokeColor={getProgressColor(stockPercentage)}
                                trailColor="#374151"
                                showInfo={false}
                                size="small"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Min: {srNo.min_stock}</span>
                                <span>Max: {srNo.max_stock}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <Text className="text-gray-400">
                                  Available:
                                </Text>
                                <br />
                                <Text className="text-white font-medium">
                                  {srNo.current_stock} {srNo.unit}
                                </Text>
                              </div>
                              <div>
                                <Text className="text-gray-400">Status:</Text>
                                <br />
                                <Tag color={stockStatus.color} className="mt-1">
                                  {stockStatus.level.toUpperCase()}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Text className="text-gray-300">Available:</Text>
                              <Text className="text-white font-medium">
                                {srNo.current_stock} {srNo.unit}
                              </Text>
                            </div>
                          </div>
                        )}

                        {isRetailer && srNo.current_stock > 0 && (
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <Text className="text-gray-300">Quantity:</Text>
                              <Space.Compact>
                                <Button
                                  icon={<Minus className="w-4 h-4" />}
                                  onClick={() =>
                                    handleQuantityChange(
                                      srNo.id,
                                      Math.max(0, currentQuantity - 1)
                                    )
                                  }
                                  disabled={currentQuantity <= 0}
                                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                                />
                                <InputNumber
                                  min={0}
                                  max={srNo.current_stock}
                                  step={0.5}
                                  value={currentQuantity}
                                  onChange={(value) =>
                                    handleQuantityChange(srNo.id, value)
                                  }
                                  className="w-16 sm:w-20 text-center bg-gray-700 border-gray-600"
                                  controls={false}
                                />
                                <Button
                                  icon={<Plus className="w-4 h-4" />}
                                  onClick={() =>
                                    handleQuantityChange(
                                      srNo.id,
                                      Math.min(
                                        srNo.current_stock,
                                        currentQuantity + 1
                                      )
                                    )
                                  }
                                  disabled={
                                    currentQuantity >= srNo.current_stock
                                  }
                                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                                />
                              </Space.Compact>
                            </div>

                            <Button
                              type="primary"
                              icon={<ShoppingCart className="w-4 h-4" />}
                              onClick={() => handleAddToCart(srNo)}
                              disabled={currentQuantity <= 0}
                              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        )}

                        {isRetailer && srNo.current_stock === 0 && (
                          <Button disabled className="w-full">
                            Out of Stock
                          </Button>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
