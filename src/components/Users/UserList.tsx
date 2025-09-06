import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
  message,
  Dropdown,
  Upload,
  Form,
  Select,
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
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  userService,
  UserResponse,
  CreateRetailerRequest,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;
const { Dragger } = Upload;

export const RetailerList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [singleModalVisible, setSingleModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

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
              const data = await userService.searchUsers(searchTerm);
              setUsers(data);
            } catch (error) {
              console.error("Failed to search users:", error);
              message.error("Failed to search users. Please try again.");
            } finally {
              setSearchLoading(false);
            }
          } else {
            // If search is empty, fetch all users
            setLoading(true);
            try {
              const data = await userService.getAllUsers();
              setUsers(data);
            } catch (error) {
              console.error("Failed to fetch users:", error);
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
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const retailers = users.filter(
    (user) => user.role === "CUSTOMER" || user.role === "SALES"
  );

  const handleAddRetailer = () => {
    setEditingUser(null);
    setSingleModalVisible(true);
    form.resetFields();
  };

  const handleEditRetailer = async (retailerId: number) => {
    try {
      const user = await userService.getUserById(retailerId);
      setEditingUser(user);
      setSingleModalVisible(true);
      form.setFieldsValue({
        name: user.name,
        mobile_no: user.mobile_no,
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
      if (editingUser) {
        // Update existing user
        await userService.updateProfile(editingUser.id, {
          name: values.name,
          mobile_no: values.mobile_no,
          shop_name: values.shop_name,
          role: values.role,
          status: values.status,
        });
        message.success("User updated successfully!");
      } else {
        // Create new user
        const userData: CreateRetailerRequest = {
          name: values.name,
          mobile_no: values.mobile_no,
          shop_name: values.shop_name,
          role: values.role,
          status: values.status,
        };

        await userService.addRetailer(userData);
        message.success("User created successfully!");
      }

      setSingleModalVisible(false);
      setEditingUser(null);
      form.resetFields();

      // Refresh users list
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
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
    console.log("CSV Headers:", headers);

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
      if (!["ADMIN", "SALES", "CUSTOMER"].includes(role.toUpperCase())) {
        console.warn(`Skipping row ${i + 1}: invalid role ${role}`);
        continue;
      }

      // Validate status
      if (!["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
        console.warn(`Skipping row ${i + 1}: invalid status ${status}`);
        continue;
      }

      users.push({
        name,
        mobile_no: mobileNo,
        shop_name: shopName,
        role: role.toUpperCase() as "ADMIN" | "SALES" | "CUSTOMER",
        status: status.toUpperCase() as "ACTIVE" | "INACTIVE",
      });
    }

    if (users.length === 0) {
      throw new Error("No valid users found in CSV file");
    }

    console.log("Parsed users:", users);
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
      console.log("CSV Content:", csvContent);

      const usersData = parseCSVToUsers(csvContent);
      console.log("Parsed Users Data:", usersData);

      // Create users one by one (since there's no bulk user creation API)
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const userData of usersData) {
        try {
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
        const updatedUsers = await userService.getAllUsers();
        setUsers(updatedUsers);
      } else if (successCount > 0 && errorCount > 0) {
        message.warning(
          `Created ${successCount} users with ${errorCount} errors. Check console for details.`
        );
        console.log("Errors:", errors);
        setBulkModalVisible(false);
        // Refresh users list
        const updatedUsers = await userService.getAllUsers();
        setUsers(updatedUsers);
      } else {
        message.error("Failed to create any users. Check console for details.");
        console.log("Errors:", errors);
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
    navigate(`/users/manage-collection-access/${retailerId}`);
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
          await userService.deleteUser(retailerId);
          message.success(`Retailer "${retailerName}" deleted successfully!`);

          // Refresh the retailers list
          const updatedUsers = await userService.getAllUsers();
          setUsers(updatedUsers);
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
    <Col xs={24} sm={12} lg={8} xl={6} className="mb-4">
      <Card className="bg-gray-800 border-gray-700 h-64">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </Col>
  );

  return (
    <MainLayout title="Users">
      <div className="space-y-2">
        {/* Search and Add Button - Fixed Position */}
        <div className="sticky top-0 z-10 bg-gray-900/95 pt-4 -mx-4 px-4 backdrop-blur-sm border-b border-gray-700/50 pb-4 mb-4">
          <div className="flex gap-4 items-center justify-end">
            <AntSearch
              placeholder="Search users..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full md:w-80 lg:w-96"
              size="large"
              loading={searchLoading}
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
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Add User</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Retailers Grid */}
        {loading || searchLoading ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <RetailerSkeleton key={index} />
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {retailers.length === 0 ? (
              <Col span={24}>
                <Card className="bg-gray-800 border-gray-700 text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <Title level={4} className="!text-gray-400 !mb-2">
                    No Users Found
                  </Title>
                  <Text className="text-gray-500">
                    {searchText
                      ? "Try adjusting your search terms"
                      : "No users available at the moment"}
                  </Text>
                </Card>
              </Col>
            ) : (
              retailers.map((retailer) => (
                <Col xs={24} sm={12} md={12} lg={12} xl={8} key={retailer.id}>
                  <Card
                    hoverable
                    // onClick={() => handleRetailerClick(retailer.id)}
                    className="bg-gray-800 border-gray-700 cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Avatar
                            size="large"
                            className="bg-purple-600"
                            icon={<UserCheck className="w-6 h-6" />}
                          />
                          <Title level={5} className="!text-white !mb-0">
                            {retailer.name}
                          </Title>
                        </div>
                        <div className="flex items-center mt-1">
                          <Tag
                            color={
                              retailer.status === "ACTIVE" ? "green" : "red"
                            }
                          >
                            {retailer.status}
                          </Tag>
                          <Tag
                            color={retailer.role === "ADMIN" ? "green" : "red"}
                          >
                            {retailer.role.charAt(0) +
                              retailer.role.slice(1).toLowerCase()}
                          </Tag>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Store className="w-4 h-4" />
                          <Text className="text-gray-400 text-sm">
                            {retailer.shop_name}
                          </Text>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Phone className="w-4 h-4" />
                          <Text className="text-gray-400 text-sm">
                            {retailer.mobile_no}
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

                      <div className="flex items-center justify-between space-x-2 pt-2 border-t border-gray-700">
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
              ))
            )}
          </Row>
        )}

        {/* Bulk Upload Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <UploadIcon className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-white">Bulk Upload Users</span>
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
                Upload CSV file to add multiple users at once
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
                  Supports CSV files with users data
                </Text>
              </div>
            </Dragger>

            {uploading && (
              <div className="text-center py-4">
                <Text className="text-purple-400">Uploading users...</Text>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <Text className="text-gray-300 text-sm">
                <strong>CSV Format Requirements:</strong>
              </Text>
              <ul className="text-gray-400 text-xs mt-2 space-y-1">
                <li>
                  • Required columns: name, mobile_no, shop_name, role, status
                </li>
                <li>• Role must be one of: ADMIN, SALES, CUSTOMER</li>
                <li>• Status must be one of: ACTIVE, INACTIVE</li>
                <li>• Mobile number must be 10 digits</li>
                <li>• Download template for reference</li>
              </ul>
            </div>
          </div>
        </Modal>

        {/* Single User Modal */}
        <Modal
          title={
            <div className="flex items-center mb-2">
              {editingUser ? (
                <Edit className="w-5 h-5 mr-2 text-purple-400" />
              ) : (
                <Plus className="w-5 h-5 mr-2 text-purple-400" />
              )}
              <span className="text-white">
                {editingUser ? "Edit User" : "Add New User"}
              </span>
            </div>
          }
          open={singleModalVisible}
          onCancel={() => {
            setSingleModalVisible(false);
            setEditingUser(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
          className="single-user-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSingleUserSubmit}
            initialValues={{ role: "CUSTOMER", status: "ACTIVE" }}
            autoComplete="off"
          >
            <Form.Item
              label={<span className="text-gray-300">Name</span>}
              name="name"
              rules={[{ required: true, message: "Please enter user name" }]}
            >
              <Input
                placeholder="Enter user name"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Mobile Number</span>}
              name="mobile_no"
              rules={[
                { required: true, message: "Please enter mobile number" },
                {
                  pattern: /^\d{10}$/,
                  message: "Please enter valid 10-digit mobile number",
                },
              ]}
            >
              <Input
                placeholder="Enter mobile number"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
                autoComplete="off"
                type="tel"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Shop Name</span>}
              name="shop_name"
              rules={[{ required: true, message: "Please enter shop name" }]}
            >
              <Input
                placeholder="Enter shop name"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Role</span>}
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select
                placeholder="Select role"
                className="bg-gray-700 border-gray-600"
                size="large"
              >
                <Option value="ADMIN">Administrator</Option>
                <Option value="SALES">Sales Manager</Option>
                <Option value="CUSTOMER">Retailer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Status</span>}
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select status"
                className="bg-gray-700 border-gray-600"
                size="large"
              >
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => {
                    setSingleModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                  }}
                  size="large"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  {editingUser ? "Update User" : "Add User"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
