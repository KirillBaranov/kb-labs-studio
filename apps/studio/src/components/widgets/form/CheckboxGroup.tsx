/**
 * @module @kb-labs/studio-app/components/widgets/form/CheckboxGroup
 * CheckboxGroup widget - multiple checkboxes
 */

import * as React from 'react';
import { Checkbox, Form, Space, Typography } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { CheckboxGroupOptions as ContractOptions, CheckboxGroupData } from '@kb-labs/studio-contracts';

const { Text } = Typography;

export interface CheckboxGroupOptions extends ContractOptions {}

export interface CheckboxGroupProps extends BaseWidgetProps<CheckboxGroupData, CheckboxGroupOptions> {
  onChange?: (values: (string | number)[]) => void;
}

export function CheckboxGroup({ data, options, onChange }: CheckboxGroupProps) {
  const {
    label,
    helpText,
    required,
    disabled,
    direction = 'vertical',
    gap = 8,
    showSelectAll,
  } = options ?? {};

  // Merge options from data and static options
  const checkboxOptions = data?.options || options?.options || [];

  const allValues = checkboxOptions.map((opt) => opt.value);
  const isAllSelected = data?.values?.length === allValues.length;
  const isIndeterminate = data?.values?.length > 0 && data?.values?.length < allValues.length;

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      onChange?.(allValues);
    } else {
      onChange?.([]);
    }
  };

  const handleChange = (checkedValues: (string | number)[]) => {
    onChange?.(checkedValues);
  };

  const checkboxGroup = (
    <div>
      {showSelectAll && checkboxOptions.length > 0 && (
        <Checkbox
          indeterminate={isIndeterminate}
          checked={isAllSelected}
          onChange={handleSelectAll}
          disabled={disabled}
          style={{ marginBottom: gap }}
        >
          Select All
        </Checkbox>
      )}
      <Checkbox.Group
        value={data?.values}
        onChange={handleChange}
        disabled={disabled}
      >
        <Space direction={direction} size={gap} wrap>
          {checkboxOptions.map((opt) => (
            <Checkbox key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
              {opt.description && (
                <Text type="secondary" style={{ display: 'block', fontSize: '0.85em' }}>
                  {opt.description}
                </Text>
              )}
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>
    </div>
  );

  if (label) {
    return (
      <Form.Item
        label={label}
        required={required}
        help={data?.error || helpText}
        validateStatus={data?.error ? 'error' : undefined}
      >
        {checkboxGroup}
      </Form.Item>
    );
  }

  return checkboxGroup;
}
