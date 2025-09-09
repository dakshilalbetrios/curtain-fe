import React from "react";
import {
  Modal,
  Button,
  Upload,
  Typography,
} from "antd";
import {
  Upload as UploadIcon,
  Download,
} from "lucide-react";

const { Text } = Typography;
const { Dragger } = Upload;

interface BulkUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  onDownloadTemplate: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  uploading,
  onDownloadTemplate,
}) => {
  const handleCSVUpload = async (file: File) => {
    await onUpload(file);
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <UploadIcon className="w-5 h-5 mr-2 text-purple-400" />
          <span className="theme-text-primary">Bulk Upload Users</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="bulk-upload-modal"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Text className="theme-text-secondary hidden md:block">
            Upload CSV file to add multiple users at once
          </Text>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={onDownloadTemplate}
            className="theme-button"
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
          className="theme-input !border-none hover:border-purple-500"
        >
          <div className="p-6 text-center">
            <UploadIcon className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
            <Text className="theme-text-primary text-lg block mb-2">
              Click or drag CSV file to upload
            </Text>
            <Text className="theme-text-secondary">
              Supports CSV files with users data
            </Text>
          </div>
        </Dragger>

        {uploading && (
          <div className="text-center py-4">
            <Text className="text-purple-400">Uploading users...</Text>
          </div>
        )}

        <div className="mt-4 p-3 theme-bg-tertiary rounded-lg">
          <Text className="theme-text-secondary text-sm">
            <strong>CSV Format Requirements:</strong>
          </Text>
          <ul className="theme-text-tertiary text-xs mt-2 space-y-1">
            <li>
              • Required columns: name, mobile_no, shop_name, role, status
            </li>
            <li>
              • Role must be one of: CUSTOMER, SALES, ADMIN
            </li>
            <li>
              • Status must be one of: ACTIVE, INACTIVE
            </li>
            <li>• Mobile number must be 10 digits</li>
            <li>• Download template for reference</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
