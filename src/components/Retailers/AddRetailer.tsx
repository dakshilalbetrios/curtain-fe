import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  message,
  Upload,
} from "antd";
import { UserPlus, Upload as UploadIcon, Download, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  userService,
  CreateRetailerRequest,
  UserResponse,
} from "../../services";
import { MainLayout } from "../Layout/MainLayout";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface RetailerFormData {
  name: string;
  mobile_no: string;
  password: string;
  shop_name: string;
  role: "ADMIN" | "SALES" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
}

export const AddRetailer: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      setEditMode(true);
      loadUserData(parseInt(id));
    }
  }, [id]);

  const loadUserData = async (userId: number) => {
    try {
      const user = await userService.getUserById(userId);
      setEditingUser(user);
      form.setFieldsValue({
        name: user.name,
        mobile_no: user.mobile_no,
        shop_name: user.shop_name,
        role: user.role,
        status: user.status,
        password: "", // Don't pre-fill password
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      message.error("Failed to load user data");
      navigate("/retailers");
    }
  };

  const handleSubmit = async (values: RetailerFormData) => {
    setLoading(true);
    try {
      if (editMode && editingUser) {
        // Update existing user
        await userService.updateProfile(editingUser.id, {
          name: values.name,
          mobile_no: values.mobile_no,
          shop_name: values.shop_name,
          role: values.role,
          status: values.status,
        });

        // Update password if provided
        if (values.password) {
          await userService.changePassword(editingUser.id, values.password);
        }

        message.success("Retailer updated successfully!");
      } else {
        // Create new user
        await userService.addRetailer(values);
        message.success("Retailer added successfully!");
      }
      navigate("/retailers");
    } catch (error) {
      message.error(
        editMode ? "Failed to update retailer" : "Failed to add retailer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        message.error("Please upload a CSV file");
        setUploading(false);
        return false;
      }

      // Read CSV file content
      const csvContent = await readFileContent(file);

      // Basic validation - check if it has the required headers
      const lines = csvContent.split("\n");
      const headers = lines[0]
        ?.toLowerCase()
        .split(",")
        .map((header) => header.trim().replace(/\r/g, ""));
      console.log("headers", headers);
      const requiredHeaders = [
        "name",
        "mobile_no",
        "password",
        "shop_name",
        "role",
        "status",
      ];

      const hasRequiredHeaders = requiredHeaders.every((header) =>
        headers?.includes(header.trim())
      );

      if (!hasRequiredHeaders) {
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers?.includes(header.trim())
        );
        message.error(
          `CSV file is missing required columns: ${missingHeaders.join(
            ", "
          )}. Found columns: ${headers?.join(", ")}`
        );
        setUploading(false);
        return false;
      }

      // Parse CSV data to array format
      const usersData = parseCSVToUsers(csvContent);

      if (usersData.length === 0) {
        message.error("No valid user data found in CSV file");
        setUploading(false);
        return false;
      }

      // Call the bulk upload API
      const result = await userService.bulkUploadUsers(usersData);

      // Show detailed success message
      if (result.successCount > 0) {
        message.success(
          `Successfully created ${result.successCount} users! ${
            result.errorCount > 0 ? `${result.errorCount} errors occurred.` : ""
          }`,
          4
        );
      } else if (result.errorCount > 0) {
        // Show warning if no users were created but there were errors
        message.warning(
          `No users were created. ${result.errorCount} errors occurred. Check console for details.`,
          4
        );
      }

      // Show errors in console for debugging
      if (result.errorCount > 0) {
        console.error("Upload errors:", result.errors);
        if (result.createdUsers.length > 0) {
          console.log("Created users:", result.createdUsers);
        }
      }

      // Always redirect to retailers list after showing the message
      setTimeout(() => {
        navigate("/retailers");
      }, 2000);
    } catch (error) {
      console.error("Bulk upload error:", error);
      message.error(
        "Failed to process CSV file. Please check the format and try again."
      );
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload
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

  const parseCSVToUsers = (csvContent: string): CreateRetailerRequest[] => {
    const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().toLowerCase().replace(/\r/g, ""));

    console.log("CSV Headers:", headers);
    console.log("CSV Lines:", lines);

    const users: CreateRetailerRequest[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);

      console.log(`Row ${i + 1}:`, {
        line,
        values,
        headersLength: headers.length,
        valuesLength: values.length,
      });

      if (values.length !== headers.length) {
        console.warn(`Skipping malformed row ${i + 1}: ${line}`);
        console.warn(
          `Expected ${headers.length} columns, got ${values.length}`
        );
        continue; // Skip malformed rows
      }

      const user: CreateRetailerRequest = {
        name: values[headers.indexOf("name")] || "",
        mobile_no: values[headers.indexOf("mobile_no")] || "",
        password: values[headers.indexOf("password")] || "",
        shop_name: values[headers.indexOf("shop_name")] || "",
        role:
          (values[headers.indexOf("role")] as "ADMIN" | "SALES" | "CUSTOMER") ||
          "CUSTOMER",
        status:
          (values[headers.indexOf("status")] as "ACTIVE" | "INACTIVE") ||
          "ACTIVE",
      };

      console.log(`Parsed user ${i + 1}:`, user);

      // Basic validation
      if (user.name && user.mobile_no && user.password && user.shop_name) {
        users.push(user);
      } else {
        console.warn(
          `Skipping incomplete row ${i + 1}: Missing required fields`,
          {
            name: user.name,
            mobile_no: user.mobile_no,
            password: user.password,
            shop_name: user.shop_name,
          }
        );
      }
    }

    console.log("Final parsed users:", users);
    return users;
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
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());

    // Remove quotes from the beginning and end of each field and clean carriage returns
    return result.map((field) => {
      let cleanedField = field;
      if (cleanedField.startsWith('"') && cleanedField.endsWith('"')) {
        cleanedField = cleanedField.slice(1, -1);
      }
      return cleanedField.replace(/\r/g, "").trim();
    });
  };

  const downloadTemplate = () => {
    const csvContent = `name,mobile_no,password,shop_name,role,status
John Doe,9876543210,1234,SampleShop,CUSTOMER,ACTIVE
Jane Smith,9876543211,1234,SmithFurnishing,CUSTOMER,ACTIVE
Mike Johnson,9876543212,1234,JohnsonBlinds,SALES,ACTIVE`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "retailer_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout
      title={editMode ? "Edit Retailer" : "Add Retailer"}
      showBack={true}
    >
      <div className="space-y-6">
        {/* Manual Form */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4 flex items-center">
            {editMode ? (
              <>
                <Edit className="w-5 h-5 mr-2" />
                Edit Retailer
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Retailer
              </>
            )}
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: "CUSTOMER", status: "ACTIVE" }}
          >
            <Form.Item
              label={<span className="text-gray-300">Name</span>}
              name="name"
              rules={[
                { required: true, message: "Please enter retailer name" },
              ]}
            >
              <Input
                placeholder="Enter retailer name"
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
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
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Password</span>}
              name="password"
              rules={[
                { required: !editMode, message: "Please enter password" },
                { min: 4, message: "Password must be at least 4 characters" },
              ]}
            >
              <Input.Password
                placeholder={
                  editMode
                    ? "Enter new password (leave blank to keep current)"
                    : "Enter password"
                }
                className="bg-gray-700 border-gray-600 text-white"
                size="large"
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                {editMode ? "Update Retailer" : "Add Retailer"}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* CSV Import */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4 flex items-center">
            <UploadIcon className="w-5 h-5 mr-2" />
            Bulk Import
          </Title>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text className="text-gray-300">
                Upload CSV file to add multiple retailers at once
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
              beforeUpload={handleCSVUpload}
              accept=".csv"
              showUploadList={false}
              className="bg-gray-700 border-gray-600 hover:border-purple-500"
            >
              <div className="p-6 text-center">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Text className="text-white text-lg block mb-2">
                  Click or drag CSV file to upload
                </Text>
                <Text className="text-gray-400">
                  Supports CSV files with retailer data
                </Text>
              </div>
            </Dragger>

            {uploading && (
              <div className="text-center">
                <Text className="text-purple-400">Processing CSV file...</Text>
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
