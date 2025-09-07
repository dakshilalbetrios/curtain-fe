import React from "react";
import { Input } from "antd";
import { Form } from "antd";

interface TelephoneFieldProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
  className?: string;
  maxLength?: number;
  status?: "error" | "warning";
}

export const TelephoneField: React.FC<TelephoneFieldProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  required = false,
  size = "small",
  style,
  className,
  maxLength = 10,
  status,
}) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "ant-input-sm";
      case "large":
        return "ant-input-lg";
      default:
        return "";
    }
  };

  // Clean the value to remove 91 prefix if present
  const cleanValue = React.useMemo(() => {
    if (!value) return "";

    // Remove 91 prefix if present
    let cleaned = value.replace(/^\ 91\s*/, "");

    // Remove any non-digit characters and limit to maxLength digits
    cleaned = cleaned.replace(/\D/g, "").slice(0, maxLength);

    return cleaned;
  }, [value, maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      // Remove any non-digit characters and limit to maxLength digits
      const inputValue = e.target.value;
      const cleanValue = inputValue.replace(/\D/g, "").slice(0, maxLength);
      onChange(cleanValue);
    }
  };

  return (
    <div
      className={`phone-input-wrapper ${getSizeClass()} ${className || ""}`}
      style={{ width: "100%" }}
    >
      <div className="phone-prefix text-sm">+91</div>
      <Input
        value={cleanValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        status={status}
        className={`phone-input ${getSizeClass()}`}
        style={{
          ...style,
          width: "100%",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          background: "transparent",
        }}
        maxLength={maxLength}
      />
    </div>
  );
};

// Form Item wrapper for Ant Design Form integration
export const TelephoneInputFormItem: React.FC<{
  name: string;
  label?: string;
  required?: boolean;
  rules?: any[];
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
  className?: string;
  maxLength?: number;
}> = ({
  name,
  label,
  required = false,
  rules = [],
  value,
  onChange,
  placeholder,
  disabled,
  size,
  style,
  className,
  maxLength,
}) => {
  const validationRules = [
    ...rules,
    {
      required,
      message: `${label || "Phone number"} is required`,
    },
    {
      validator: (_: any, value: string) => {
        if (!value) {
          return Promise.resolve();
        }
        // Basic phone number validation
        if (value.length < 10) {
          return Promise.reject(new Error("Please enter a valid phone number"));
        }
        return Promise.resolve();
      },
    },
  ];

  return (
    <Form.Item name={name} label={label} rules={validationRules} style={style}>
      <TelephoneField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        className={className}
        maxLength={maxLength}
      />
    </Form.Item>
  );
};
