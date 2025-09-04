import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Tag, Skeleton } from "antd";
import { useParams } from "react-router-dom";
import { collectionService, CollectionResponse } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import { SerialNumberManagement } from "./SerialNumberManagement";

const { Title, Text } = Typography;

export const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<CollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const collectionId = parseInt(id || "0");

  const fetchCollection = async () => {
    try {
      const data = await collectionService.getCollectionById(collectionId);
      setCollection(data);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId]);

  // Skeleton loading component
  const SerialNumberSkeleton = () => (
    <Col xs={24} sm={12} lg={8} className="mb-4">
      <Card className="bg-gray-800 border-gray-700 h-80">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <MainLayout title="Loading..." showBack={true}>
        <div className="space-y-6">
          {/* Collection Header Skeleton */}
          <Card className="bg-gray-800 border-gray-700">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>

          {/* Serial Numbers Skeleton */}
          <div>
            <Skeleton.Input
              active
              size="default"
              className="!w-48 !h-6 !mb-4"
            />
            <Row gutter={[16, 16]}>
              {[...Array(6)].map((_, index) => (
                <SerialNumberSkeleton key={index} />
              ))}
            </Row>
          </div>
        </div>
      </MainLayout>
    );
  }

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

  const serialNumbers = collection.serial_numbers || [];

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
        <SerialNumberManagement
          collectionId={collection?.id || 0}
          serialNumbers={serialNumbers}
          onSerialNumbersUpdate={fetchCollection}
          collectionName={collection?.name || ""}
        />
      </div>
    </MainLayout>
  );
};
