/**
 * @module @kb-labs/studio-app/components/widgets/form/DatePicker
 * DatePicker widget - date/time picker
 */

import * as React from 'react';
import { DatePicker as AntDatePicker, TimePicker, Form } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { BaseWidgetProps } from '../types';
import type { DatePickerOptions as ContractOptions, DatePickerData } from '@kb-labs/studio-contracts';

const { RangePicker } = AntDatePicker;

export interface DatePickerOptions extends ContractOptions {}

export interface DatePickerProps extends BaseWidgetProps<DatePickerData, DatePickerOptions> {
  onChange?: (value: string | [string, string] | null) => void;
}

export function DatePicker({ data, options, onChange }: DatePickerProps) {
  const {
    label,
    placeholder,
    helpText,
    required,
    disabled,
    size = 'md',
    mode = 'date',
    format,
    minDate,
    maxDate,
    showTime,
    use12Hours,
    showToday = true,
    clearable = true,
    showWeekNumbers,
    inline,
  } = options ?? {};

  const sizeMap: Record<string, 'small' | 'middle' | 'large'> = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
  };

  // Parse value to dayjs
  const parseValue = (value: string | [string, string] | null): Dayjs | [Dayjs, Dayjs] | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return [dayjs(value[0]), dayjs(value[1])];
    }
    return dayjs(value);
  };

  // Format dayjs to string
  const formatValue = (value: Dayjs | [Dayjs, Dayjs] | null): string | [string, string] | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return [value[0].toISOString(), value[1].toISOString()];
    }
    return value.toISOString();
  };

  const handleChange = (value: Dayjs | [Dayjs, Dayjs] | null) => {
    onChange?.(formatValue(value));
  };

  // Disable dates outside min/max range
  const disabledDate = (current: Dayjs) => {
    if (!current) return false;

    // Check min/max
    if (minDate && current.isBefore(dayjs(minDate), 'day')) return true;
    if (maxDate && current.isAfter(dayjs(maxDate), 'day')) return true;

    // Check disabled dates from data
    if (data?.disabledDates) {
      return data.disabledDates.some(d => current.isSame(dayjs(d), 'day'));
    }

    return false;
  };

  const commonProps = {
    value: parseValue(data?.value ?? null) as any,
    onChange: handleChange as any,
    disabled,
    size: sizeMap[size],
    allowClear: clearable,
    disabledDate,
    showToday,
    status: data?.error ? 'error' as const : undefined,
    style: inline ? undefined : { width: '100%' },
    open: inline ? true : undefined,
  };

  const renderPicker = () => {
    if (mode === 'time') {
      return (
        <TimePicker
          {...commonProps}
          format={format || (use12Hours ? 'h:mm A' : 'HH:mm')}
          use12Hours={use12Hours}
          placeholder={placeholder as string}
        />
      );
    }

    if (mode === 'range') {
      return (
        <RangePicker
          {...commonProps}
          format={format}
          showTime={showTime}
          showWeek={showWeekNumbers}
        />
      );
    }

    const pickerMap: Record<string, 'date' | 'week' | 'month' | 'year'> = {
      date: 'date',
      datetime: 'date',
      week: 'week',
      month: 'month',
      year: 'year',
    };

    return (
      <AntDatePicker
        {...commonProps}
        picker={pickerMap[mode] || 'date'}
        format={format}
        showTime={showTime || mode === 'datetime'}
        showWeek={showWeekNumbers}
        placeholder={placeholder as string}
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
        {renderPicker()}
      </Form.Item>
    );
  }

  return renderPicker();
}
