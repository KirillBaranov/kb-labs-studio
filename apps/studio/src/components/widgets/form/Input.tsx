/**
 * @module @kb-labs/studio-app/components/widgets/form/Input
 * Input widget - text input with validation
 */

import * as React from 'react';
import { Input as AntInput, InputNumber, Form } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { InputOptions as ContractOptions, InputData } from '@kb-labs/studio-contracts';

const { TextArea, Password, Search } = AntInput;

export interface InputOptions extends ContractOptions {}

export interface InputProps extends BaseWidgetProps<InputData, InputOptions> {
  onChange?: (value: string | number) => void;
}

export function Input({ data, options, onChange }: InputProps) {
  const {
    type = 'text',
    label,
    placeholder,
    helpText,
    required,
    disabled,
    readOnly,
    size = 'md',
    maxLength,
    rows = 4,
    autoResize,
    showCount,
    prefixIcon,
    suffixIcon,
    clearable,
    showPasswordToggle,
    autoFocus,
  } = options ?? {};

  const sizeMap: Record<string, 'small' | 'middle' | 'large'> = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleNumberChange = (value: number | null) => {
    if (value !== null) {
      onChange?.(value);
    }
  };

  const renderInput = () => {
    const commonProps = {
      value: data?.value,
      placeholder,
      disabled: disabled || data?.loading,
      readOnly,
      size: sizeMap[size],
      maxLength,
      showCount,
      allowClear: clearable,
      autoFocus,
      status: data?.error ? 'error' as const : undefined,
    };

    if (type === 'textarea') {
      return (
        <TextArea
          {...commonProps}
          onChange={handleChange}
          rows={rows}
          autoSize={autoResize ? { minRows: rows, maxRows: rows * 2 } : undefined}
        />
      );
    }

    if (type === 'password') {
      return (
        <Password
          {...commonProps}
          onChange={handleChange}
          visibilityToggle={showPasswordToggle}
        />
      );
    }

    if (type === 'search') {
      return (
        <Search
          {...commonProps}
          onChange={handleChange}
          onSearch={(value) => onChange?.(value)}
        />
      );
    }

    if (type === 'number') {
      return (
        <InputNumber
          {...commonProps}
          onChange={handleNumberChange}
          min={options?.min}
          max={options?.max}
          step={options?.step}
          style={{ width: '100%' }}
        />
      );
    }

    return (
      <AntInput
        {...commonProps}
        type={type}
        onChange={handleChange}
        prefix={prefixIcon}
        suffix={suffixIcon}
      />
    );
  };

  if (label) {
    return (
      <Form.Item
        label={label}
        required={required}
        help={data?.error || helpText}
        validateStatus={data?.error ? 'error' : undefined}
      >
        {renderInput()}
      </Form.Item>
    );
  }

  return renderInput();
}
