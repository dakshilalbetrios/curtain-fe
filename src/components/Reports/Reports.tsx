import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  message,
  Spin,
  Tag,
  Empty,
} from "antd";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MainLayout } from "../Layout/MainLayout";
import { reportService } from "../../services";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  id: string;
  type:
    | "most_ordered_serial_numbers"
    | "customer_collection_orders"
    | "customer_order_summary"
    | "collection_performance";
  format: "csv";
  dateRange: [string, string];
  status: "generating" | "ready" | "error";
  downloadUrl?: string;
  generatedAt?: string;
}

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [reportType, setReportType] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportData[]>([]);

  // Check if user is admin
  const isAdmin = user?.role === "ADMIN";

  const reportTypes = [
    {
      key: "most_ordered_serial_numbers",
      title: "Most Ordered Serial Numbers",
      description: "Top performing products by order volume",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "blue",
    },
    {
      key: "customer_collection_orders",
      title: "Customer Collection Orders",
      description: "Orders based on customer access and permissions",
      icon: <Users className="w-6 h-6" />,
      color: "green",
    },
    {
      key: "customer_order_summary",
      title: "Customer Order Summary",
      description: "Summary of customer orders and performance",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "purple",
    },
    {
      key: "collection_performance",
      title: "Collection Performance",
      description: "Performance analytics for collections",
      icon: <FileText className="w-6 h-6" />,
      color: "orange",
    },
  ];

  const handleGenerateReport = async () => {
    if (!dateRange || !reportType) {
      message.warning("Please select date range and report type");
      return;
    }

    setGenerating(true);
    try {
      const reportData: ReportData = {
        id: `report_${Date.now()}`,
        type: reportType as
          | "most_ordered_serial_numbers"
          | "customer_collection_orders"
          | "customer_order_summary"
          | "collection_performance",
        format: "csv",
        dateRange: [
          dateRange[0].format("YYYY-MM-DD"),
          dateRange[1].format("YYYY-MM-DD"),
        ],
        status: "generating",
      };

      setReportHistory((prev) => [reportData, ...prev]);

      // Download CSV directly
      const blob = await reportService.downloadCSVReport(
        reportType,
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD")
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportType}_${dateRange[0].format(
        "YYYY-MM-DD"
      )}_to_${dateRange[1].format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update report status to ready
      setReportHistory((prev) =>
        prev.map((report) =>
          report.id === reportData.id
            ? {
                ...report,
                status: "ready",
                generatedAt: new Date().toISOString(),
              }
            : report
        )
      );

      message.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate report:", error);
      message.error("Failed to generate report. Please try again.");

      // Update report status to error
      setReportHistory((prev) =>
        prev.map((report) =>
          report.id === `report_${Date.now()}`
            ? { ...report, status: "error" }
            : report
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (report: ReportData) => {
    try {
      const blob = await reportService.downloadCSVReport(
        report.type,
        report.dateRange[0],
        report.dateRange[1]
      );

      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${report.type}_${report.dateRange[0]}_to_${report.dateRange[1]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to download report:", error);
      message.error("Failed to download report. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generating":
        return "processing";
      case "ready":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "generating":
        return "Generating...";
      case "ready":
        return "Ready";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  if (!isAdmin) {
    return (
      <MainLayout title="Reports" showBack={true}>
        <Card className="theme-card">
          <Empty
            image={
              <FileText className="w-16 h-16 theme-text-tertiary mx-auto" />
            }
            description={
              <div className="text-center">
                <Title level={4} className="!theme-text-secondary !mb-2">
                  Access Denied
                </Title>
                <Text className="theme-text-tertiary">
                  You don't have permission to access reports. Admin access
                  required.
                </Text>
              </div>
            }
          />
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports" showBack={true}>
      <div className="space-y-6">
        {/* Header */}
        <Card className="theme-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <Title level={4} className="!theme-text-primary !mb-1">
                Generate Reports
              </Title>
              <Text className="theme-text-secondary">
                Create detailed reports for business insights
              </Text>
            </div>
          </div>
        </Card>

        {/* Report Configuration */}
        <Card className="theme-card">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <Title level={5} className="!theme-text-primary !mb-0">
                Report Configuration
              </Title>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text className="theme-text-secondary font-medium">
                    Date Range
                  </Text>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) =>
                      setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                    }
                    className="w-full"
                    size="large"
                    placeholder={["Start Date", "End Date"]}
                    format="YYYY-MM-DD"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text className="theme-text-secondary font-medium">
                    Report Type
                  </Text>
                  <Select
                    placeholder="Select report type"
                    value={reportType}
                    onChange={setReportType}
                    className="w-full"
                    size="large"
                  >
                    {reportTypes.map((type) => (
                      <Option key={type.key} value={type.key}>
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span>{type.title}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>

            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={handleGenerateReport}
                loading={generating}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-purple-600"
                disabled={!dateRange || !reportType}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
