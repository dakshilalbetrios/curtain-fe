import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Input,
  Avatar,
  Skeleton,
  message,
  Dropdown,
  Form,
  Spin,
  Modal,
} from "antd";
import {
  Users,
  Plus,
  Phone,
  Store,
  UserCheck,
  Edit,
  Trash2,
  ChevronDown,
  Upload as UploadIcon,
  RefreshCw,
} from "lucide-react";
import { UserResponse, CreateRetailerRequest } from "../../services";
import { MainLayout } from "../Layout/MainLayout";
import { useUsers } from "../../hooks/useUsers";
import { ManageCollectionAccessDrawer } from "./ManageCollectionAccessDrawer";
import { BulkUploadModal } from "./BulkUploadModal";
import { SingleUserModal } from "./SingleUserModal";
import {
  USER_ROLE,
  USER_STATUS,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  ROLE_COLORS,
} from "../../constants";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

export const RetailerList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [singleModalVisible, setSingleModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();
  const [collectionAccessDrawerVisible, setCollectionAccessDrawerVisible] =
    useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
    data: users,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refresh,
    loadMoreRef,
  } = useUsers(searchText);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const retailers = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === USER_ROLE.CUSTOMER || user.role === USER_ROLE.SALES
    );
  }, [users]);

  const handleAddRetailer = () => {
    setEditingUser(null);
    setSingleModalVisible(true);
    form.resetFields();
  };

  const handleEditRetailer = async (retailerId: number) => {
    try {
      const { userService } = await import("../../services");
      const user = await userService.getUserById(retailerId);
      setEditingUser(user);
      setSingleModalVisible(true);

      // Remove 91 prefix from mobile number for editing (show only 10 digits)
      const mobileWithoutPrefix = user.mobile_no.startsWith("91")
        ? user.mobile_no.substring(2)
        : user.mobile_no;

      form.setFieldsValue({
        name: user.name,
        mobile_no: mobileWithoutPrefix,
        shop_name: user.shop_name,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      message.error("Failed to load user data");
    }
  };

  const handleBulkUser = () => {
    setBulkModalVisible(true);
  };

  const handleSingleUserSubmit = async (values: any) => {
    try {
      // Add 91 prefix to mobile number
      const mobileWithPrefix = `91${values.mobile_no}`;

      if (editingUser) {
        // Update existing user
        const { userService } = await import("../../services");
        await userService.updateProfile(editingUser.id, {
          name: values.name,
          mobile_no: mobileWithPrefix,
          shop_name: values.shop_name,
          role: values.role,
          status: values.status,
        });
        message.success("User updated successfully!");
      } else {
        // Create new user
        const userData: CreateRetailerRequest = {
          name: values.name,
          mobile_no: mobileWithPrefix,
          shop_name: values.shop_name,
          role: values.role,
          status: values.status,
        };

        const { userService } = await import("../../services");
        await userService.addRetailer(userData);
        message.success("User created successfully!");
      }

      setSingleModalVisible(false);
      setEditingUser(null);
      form.resetFields();

      // Refresh users list
      refresh();
    } catch (error) {
      console.error("Failed to save user:", error);
      message.error(
        `Failed to ${editingUser ? "update" : "create"} user. Please try again.`
      );
    }
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

  const parseCSVToUsers = (csvContent: string): CreateRetailerRequest[] => {
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
      "name",
      "mobile_no",
      "shop_name",
      "role",
      "status",
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

    const users: CreateRetailerRequest[] = [];

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

      const name = row.name;
      const mobileNo = row.mobile_no;
      const shopName = row.shop_name;
      const role = row.role;
      const status = row.status;

      if (!name || !mobileNo || !shopName || !role || !status) {
        console.warn(`Skipping row ${i + 1}: missing required data`);
        continue;
      }

      // Validate role
      if (!Object.values(USER_ROLE).includes(role.toUpperCase() as any)) {
        console.warn(`Skipping row ${i + 1}: invalid role ${role}`);
        continue;
      }

      // Validate status
      if (!Object.values(USER_STATUS).includes(status.toUpperCase() as any)) {
        console.warn(`Skipping row ${i + 1}: invalid status ${status}`);
        continue;
      }

      users.push({
        name,
        mobile_no: `91${mobileNo}`,
        shop_name: shopName,
        role: role.toUpperCase() as any,
        status: status.toUpperCase() as any,
      });
    }

    if (users.length === 0) {
      throw new Error("No valid users found in CSV file");
    }

    return users;
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

      const usersData = parseCSVToUsers(csvContent);

      // Create users one by one (since there's no bulk user creation API)
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const userData of usersData) {
        try {
          const { userService } = await import("../../services");
          await userService.addRetailer(userData);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Failed to create user ${userData.name}: ${error}`);
        }
      }

      if (successCount > 0 && errorCount === 0) {
        message.success(`Successfully created ${successCount} users!`);
        setBulkModalVisible(false);
        // Refresh users list
        refresh();
      } else if (successCount > 0 && errorCount > 0) {
        message.warning(
          `Created ${successCount} users with ${errorCount} errors. Check console for details.`
        );

        setBulkModalVisible(false);
        // Refresh users list
        refresh();
      } else {
        message.error("Failed to create any users. Check console for details.");
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
    const csvContent = `name,mobile_no,shop_name,role,status
John Doe,9876543210,John's Store,CUSTOMER,ACTIVE
Jane Smith,9876543211,Jane's Shop,SALES,ACTIVE
Admin User,9876543212,Admin Store,ADMIN,ACTIVE
Retailer One,9876543213,Retail Store,CUSTOMER,ACTIVE
Sales Rep,9876543214,Sales Shop,SALES,ACTIVE`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "users_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManageCollections = (retailerId: number) => {
    setSelectedUserId(retailerId);
    setCollectionAccessDrawerVisible(true);
  };

  const handleCollectionAccessDrawerClose = () => {
    setCollectionAccessDrawerVisible(false);
    setSelectedUserId(null);
  };

  const handleDeleteRetailer = (retailerId: number, retailerName: string) => {
    Modal.confirm({
      title: "Delete Retailer",
      content: `Are you sure you want to delete "${retailerName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { userService } = await import("../../services");
          await userService.deleteUser(retailerId);
          message.success(`Retailer "${retailerName}" deleted successfully!`);

          // Refresh the retailers list
          refresh();
        } catch (error) {
          console.error("Delete error:", error);
          message.error(
            `Failed to delete retailer "${retailerName}". Please try again.`
          );
        }
      },
    });
  };

  // Skeleton loading component
  const RetailerSkeleton = () => (
    <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6} className="mb-4">
      <Card className="theme-card h-64">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="">
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
                      Users
                    </Title>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag color="green" className="px-3 py-1 text-sm font-medium">
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
                  placeholder="Search by name, mobile, or shop..."
                  onChange={handleSearchChange}
                  className="flex-1 min-w-0"
                  size="large"
                  allowClear
                />
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "single",
                        label: "Single User",
                        icon: <Plus className="w-4 h-4" />,
                        onClick: handleAddRetailer,
                      },
                      {
                        key: "bulk",
                        label: "Bulk User",
                        icon: <UploadIcon className="w-4 h-4" />,
                        onClick: handleBulkUser,
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
                    <span className="hidden sm:inline ml-2">Add User</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 min-h-0 max-h-full -mr-4 pr-4 pb-16 lg:pb-6">
          {/* Retailers Grid */}
          {error && (
            <Card className="theme-card text-center py-8 mb-4">
              <Title level={4} className="!theme-text-red-500 !mb-2">
                Error Loading Users
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

          {loading && users.length === 0 ? (
            <Row gutter={[16, 16]}>
              {[...Array(15)].map((_, index) => (
                <RetailerSkeleton key={index} />
              ))}
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              {retailers.length === 0 && !loading ? (
                <Col span={24}>
                  <Card className="theme-card text-center py-12">
                    <Users className="w-16 h-16 theme-text-tertiary mx-auto mb-4" />
                    <Title level={4} className="!theme-text-secondary !mb-2">
                      No Users Found
                    </Title>
                    <Text className="theme-text-tertiary">
                      {searchText
                        ? "Try adjusting your search terms"
                        : "No users available at the moment"}
                    </Text>
                  </Card>
                </Col>
              ) : (
                <>
                  {retailers.map((retailer) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={8}
                      xxl={6}
                      key={retailer.id}
                    >
                      <Card
                        hoverable
                        // onClick={() => handleRetailerClick(retailer.id)}
                        className="theme-card-hover cursor-pointer transition-all duration-300 hover:border-purple-500 h-full"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2">
                              <Avatar
                                size="large"
                                className="bg-purple-600"
                                icon={<UserCheck className="w-6 h-6" />}
                              />
                              <Title
                                level={5}
                                className="!theme-text-primary !mb-0"
                              >
                                {retailer.name}
                              </Title>
                            </div>
                            <div className="flex items-center mt-1">
                              <Tag color={STATUS_COLORS[retailer.status]}>
                                {STATUS_LABELS[retailer.status]}
                              </Tag>
                              <Tag color={ROLE_COLORS[retailer.role]}>
                                {ROLE_LABELS[retailer.role]}
                              </Tag>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 theme-text-tertiary">
                              <Store className="w-4 h-4" />
                              <Text className="theme-text-tertiary text-sm">
                                {retailer.shop_name}
                              </Text>
                            </div>
                            <div className="flex items-center space-x-2 theme-text-tertiary">
                              <Phone className="w-4 h-4" />
                              <Text className="theme-text-tertiary text-sm">
                                +{retailer.mobile_no}
                              </Text>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {/* {isWholesaler && lowStockItems.length > 0 && (
                                <Tag color="orange">
                                  Low Stock ({lowStockItems.length})
                                </Tag>
                              )} */}
                            </div>

                            <Button
                              type="link"
                              className="!text-purple-400 !p-0 !h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManageCollections(retailer.id);
                              }}
                            >
                              Manage Collections →
                            </Button>
                          </div>

                          <div className="flex items-center justify-between space-x-2 pt-2 border-t theme-border-secondary">
                            <Button
                              type="link"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRetailer(retailer.id);
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
                                handleDeleteRetailer(
                                  retailer.id,
                                  retailer.name
                                );
                              }}
                              className="!text-red-400 hover:!text-red-300 !p-0 !h-auto flex items-center gap-1"
                            >
                              Delete
                            </Button>
                          </div>

                          {/* <div className="flex items-center space-x-2 justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              type="link"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRetailer(retailer.id);
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
                                handleDeleteRetailer(retailer.id, retailer.name);
                              }}
                              className="!text-red-400 hover:!text-red-300 !p-0 !h-auto flex items-center gap-1"
                            >
                              Delete
                            </Button>
                          </div>
                        </div> */}
                        </div>
                      </Card>
                    </Col>
                  ))}

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
                            Load More Users
                          </Button>
                        )}
                      </div>
                    </Col>
                  )}

                  {!hasMore && users.length > 0 && (
                    <Col span={24} className="text-center py-8">
                      <Text className="theme-text-tertiary">
                        You've reached the end of the users list
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

          {/* Single User Modal */}
          <SingleUserModal
            visible={singleModalVisible}
            onClose={() => {
              setSingleModalVisible(false);
              setEditingUser(null);
              form.resetFields();
            }}
            onSubmit={handleSingleUserSubmit}
            editingUser={editingUser}
            form={form}
          />

          {/* Collection Access Management Drawer */}
          <ManageCollectionAccessDrawer
            visible={collectionAccessDrawerVisible}
            onClose={handleCollectionAccessDrawerClose}
            userId={selectedUserId}
          />
        </div>
      </div>
    </MainLayout>
  );
};
