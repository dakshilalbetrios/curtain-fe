import React from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import { Plus, Edit } from "lucide-react";
import { UserResponse } from "../../services";
import { TelephoneField } from "../Common/TelephoneField";
import {
  USER_ROLE,
  USER_STATUS,
  ROLE_LABELS,
  STATUS_LABELS,
} from "../../constants";

const { Option } = Select;

interface SingleUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  editingUser: UserResponse | null;
  form: any;
}

export const SingleUserModal: React.FC<SingleUserModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingUser,
  form,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center mb-2">
          {editingUser ? (
            <Edit className="w-5 h-5 mr-2 text-purple-400" />
          ) : (
            <Plus className="w-5 h-5 mr-2 text-purple-400" />
          )}
          <span className="theme-text-primary">
            {editingUser ? "Edit User" : "Add New User"}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="single-user-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          role: USER_ROLE.CUSTOMER,
          status: USER_STATUS.ACTIVE,
        }}
        autoComplete="off"
      >
        <Form.Item
          label={<span className="theme-text-secondary">Name</span>}
          name="name"
          rules={[{ required: true, message: "Please enter user name" }]}
        >
          <Input
            placeholder="Enter user name"
            className="theme-input"
            size="large"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label={<span className="theme-text-secondary">Mobile Number</span>}
          name="mobile_no"
          rules={[
            { required: true, message: "Please enter mobile number" },
            {
              pattern: /^\d{10}$/,
              message: "Please enter valid 10-digit mobile number",
            },
          ]}
        >
          <TelephoneField
            placeholder="Enter mobile number"
            size="large"
            maxLength={10}
            className="h-11 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="theme-text-secondary">Shop Name</span>}
          name="shop_name"
          rules={[{ required: true, message: "Please enter shop name" }]}
        >
          <Input
            placeholder="Enter shop name"
            className="theme-input"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={<span className="theme-text-secondary">Role</span>}
          name="role"
          rules={[{ required: true, message: "Please select role" }]}
        >
          <Select
            placeholder="Select role"
            className="theme-input"
            size="large"
          >
            {Object.entries(USER_ROLE).map(([, value]) => (
              <Option key={value} value={value}>
                {ROLE_LABELS[value]}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className="theme-text-secondary">Status</span>}
          name="status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select
            placeholder="Select status"
            className="theme-input"
            size="large"
          >
            {Object.entries(USER_STATUS).map(([, value]) => (
              <Option key={value} value={value}>
                {STATUS_LABELS[value]}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex gap-3 justify-end">
            <Button onClick={onClose} size="large" className="theme-button">
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
  );
};
