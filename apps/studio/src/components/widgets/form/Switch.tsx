/**
 * @module @kb-labs/studio-app/components/widgets/form/Switch
 * Switch widget - toggle switch
 */

import * as React from 'react';
import { Switch as AntSwitch, Form, Space, Typography } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { SwitchOptions as ContractOptions, SwitchData } from '@kb-labs/studio-contracts';

const { Text } = Typography;

export interface SwitchOptions extends ContractOptions {}

export interface SwitchProps extends BaseWidgetProps<SwitchData, SwitchOptions> {
  onChange?: (value: boolean) => void;
}

export function Switch({ data, options, onChange }: SwitchProps) {
  const {
    label,
    helpText,
    required,
    disabled,
    size = 'md',
    labelPosition = 'right',
    showLabels,
    onLabel = 'On',
    offLabel = 'Off',
    loading: optionsLoading,
  } = options ?? {};

  const sizeMap: Record<string, 'small' | 'default'> = {
    sm: 'small',
    md: 'default',
    lg: 'default',
  };

  const switchComponent = (
    <AntSwitch
      checked={data?.value}
      onChange={onChange}
      disabled={disabled}
      loading={data?.loading || optionsLoading}
      size={sizeMap[size]}
      checkedChildren={showLabels ? onLabel : undefined}
      unCheckedChildren={showLabels ? offLabel : undefined}
    />
  );

  const labelElement = label && (
    <Text style={{ marginLeft: labelPosition === 'right' ? 8 : 0, marginRight: labelPosition === 'left' ? 8 : 0 }}>
      {label}
    </Text>
  );

  const switchWithLabel = label ? (
    <Space>
      {labelPosition === 'left' && labelElement}
      {switchComponent}
      {labelPosition === 'right' && labelElement}
    </Space>
  ) : switchComponent;

  if (helpText || data?.error) {
    return (
      <Form.Item
        help={data?.error || helpText}
        validateStatus={data?.error ? 'error' : undefined}
        required={required}
      >
        {switchWithLabel}
      </Form.Item>
    );
  }

  return switchWithLabel;
}
