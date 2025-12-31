/**
 * @module @kb-labs/studio-app/components/widgets/form/Select
 * Select widget - dropdown select with search
 */

import * as React from 'react';
import { Select as AntSelect, Form, Spin } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { SelectOptions as ContractOptions, SelectData } from '@kb-labs/studio-contracts';

export interface SelectOptions extends ContractOptions {}

export interface SelectProps extends BaseWidgetProps<SelectData, SelectOptions> {
  onChange?: (value: string | number | (string | number)[]) => void;
}

export function Select({ data, options, onChange, emitEvent }: SelectProps) {
  const {
    label,
    placeholder,
    helpText,
    required,
    disabled,
    size = 'md',
    multiple,
    maxItems,
    searchable,
    searchPlaceholder,
    clearable,
    loading: optionsLoading,
    emptyMessage,
    grouped,
  } = options ?? {};

  const sizeMap: Record<string, 'small' | 'middle' | 'large'> = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
  };

  // Local state for controlled component
  const [selectedValue, setSelectedValue] = React.useState<string | number | (string | number)[] | undefined>(
    data?.value
  );

  // Sync with data.value when it changes externally
  React.useEffect(() => {
    if (data?.value !== undefined) {
      setSelectedValue(data.value);
    }
  }, [data?.value]);

  // Handle change: update local state + call onChange
  const handleChange = React.useCallback((value: string | number | (string | number)[]) => {
    setSelectedValue(value);
    if (onChange) {
      onChange(value);
    } else {
    }
  }, [onChange]);

  // Merge options from data and static options
  const selectOptions = data?.options || options?.options || [];

  // Group options if needed
  const renderOptions = () => {
    if (grouped) {
      const groups: Record<string, typeof selectOptions> = {};
      const ungrouped: typeof selectOptions = [];

      selectOptions.forEach((opt) => {
        if (opt.group) {
          if (!groups[opt.group]) {
            groups[opt.group] = [];
          }
          groups[opt.group].push(opt);
        } else {
          ungrouped.push(opt);
        }
      });

      return (
        <>
          {ungrouped.map((opt) => (
            <AntSelect.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.icon && <span style={{ marginRight: 8 }}>{opt.icon}</span>}
              {opt.label}
              {opt.description && (
                <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>
                  {opt.description}
                </span>
              )}
            </AntSelect.Option>
          ))}
          {Object.entries(groups).map(([group, opts]) => (
            <AntSelect.OptGroup key={group} label={group}>
              {opts.map((opt) => (
                <AntSelect.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.icon && <span style={{ marginRight: 8 }}>{opt.icon}</span>}
                  {opt.label}
                </AntSelect.Option>
              ))}
            </AntSelect.OptGroup>
          ))}
        </>
      );
    }

    return selectOptions.map((opt) => (
      <AntSelect.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
        {opt.icon && <span style={{ marginRight: 8 }}>{opt.icon}</span>}
        {opt.label}
        {opt.description && (
          <span style={{ color: 'var(--text-secondary)', marginLeft: 8, fontSize: '0.85em' }}>
            {opt.description}
          </span>
        )}
      </AntSelect.Option>
    ));
  };

  const selectComponent = (
    <AntSelect
      value={selectedValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      size={sizeMap[size]}
      mode={multiple ? 'multiple' : undefined}
      maxTagCount={maxItems}
      showSearch={searchable}
      filterOption={searchable ? (input, option) =>
        String(option?.children).toLowerCase().includes(input.toLowerCase())
      : undefined}
      allowClear={clearable}
      loading={data?.loading || optionsLoading}
      notFoundContent={data?.loading ? <Spin size="small" /> : emptyMessage}
      status={data?.error ? 'error' : undefined}
      style={{ width: '100%' }}
    >
      {renderOptions()}
    </AntSelect>
  );

  if (label) {
    return (
      <Form.Item
        label={label}
        required={required}
        help={data?.error || helpText}
        validateStatus={data?.error ? 'error' : undefined}
      >
        {selectComponent}
      </Form.Item>
    );
  }

  return selectComponent;
}
