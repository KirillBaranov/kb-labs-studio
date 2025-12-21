/**
 * @module @kb-labs/studio-app/components/widgets/form/Form
 * Form widget - interactive form with configurable fields for POST requests
 */

import * as React from 'react';
import { Form as AntForm, Input, Button, Select, InputNumber, Checkbox, message } from 'antd';
import type { BaseWidgetProps, FormWidgetOptions, FormField } from '../types';
import { useWidgetMutation } from '../../../hooks/useWidgetMutation';
import { studioConfig } from '../../../config/studio.config';
import type { DataSource, StudioHeaderHints } from '@kb-labs/rest-api-contracts';

const { TextArea } = Input;

export interface FormProps extends BaseWidgetProps<unknown, FormWidgetOptions> {
  pluginId?: string;
  source?: DataSource;
  headerHints?: StudioHeaderHints;
}

export function Form({
  pluginId = '',
  source,
  options,
  headerHints,
  emitEvent,
}: FormProps) {
  const [form] = AntForm.useForm();

  // Extract route configuration from source
  const routeId = source?.type === 'rest' ? source.routeId : '';
  const method = source?.type === 'rest' ? (source.method || 'POST') : 'POST';
  const basePath = studioConfig.apiBaseUrl || '/api/v1';

  const mutation = useWidgetMutation({
    pluginId,
    routeId,
    method: method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    basePath,
    headerHints,
    headers: source?.type === 'rest' ? source.headers : undefined,
    onSuccess: (data, variables) => {
      message.success('Form submitted successfully');
      if (options?.onSuccess?.emitEvent && emitEvent) {
        const payload = options.onSuccess.eventPayloadFactory
          ? options.onSuccess.eventPayloadFactory(data, variables as Record<string, unknown>)
          : { data, formData: variables };
        emitEvent(options.onSuccess.emitEvent, payload);
      }
    },
    onError: (error) => {
      message.error(`Failed to submit form: ${error.message}`);
    },
  });

  const handleSubmit = async (values: Record<string, unknown>) => {
    // Send form values as-is - no business logic in Studio
    await mutation.mutateAsync(values as any);
  };

  const renderField = (field: FormField) => {
    const { name, type, label, placeholder, required, defaultValue, options: selectOptions, rows } = field;

    switch (type) {
      case 'textarea':
        return (
          <AntForm.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `${label} is required` }] : []}
            initialValue={defaultValue}
          >
            <TextArea placeholder={placeholder} rows={rows || 4} />
          </AntForm.Item>
        );

      case 'select':
        return (
          <AntForm.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `${label} is required` }] : []}
            initialValue={defaultValue}
          >
            <Select placeholder={placeholder}>
              {selectOptions?.map((opt) => (
                <Select.Option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </AntForm.Item>
        );

      case 'number':
        return (
          <AntForm.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `${label} is required` }] : []}
            initialValue={defaultValue}
          >
            <InputNumber placeholder={placeholder} style={{ width: '100%' }} />
          </AntForm.Item>
        );

      case 'checkbox':
        return (
          <AntForm.Item
            key={name}
            name={name}
            valuePropName="checked"
            initialValue={defaultValue ?? false}
          >
            <Checkbox>{label}</Checkbox>
          </AntForm.Item>
        );

      case 'text':
      default:
        return (
          <AntForm.Item
            key={name}
            name={name}
            label={label}
            rules={required ? [{ required: true, message: `${label} is required` }] : []}
            initialValue={defaultValue}
          >
            <Input placeholder={placeholder} />
          </AntForm.Item>
        );
    }
  };

  if (!options?.fields || options.fields.length === 0) {
    return <div>No fields configured for form widget</div>;
  }

  return (
    <AntForm
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={mutation.isPending}
    >
      {options.fields.map((field) => renderField(field))}
      <AntForm.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
          {options.submitLabel || 'Submit'}
        </Button>
      </AntForm.Item>
      {mutation.error && (
        <div style={{ color: 'var(--error-color)', marginTop: '0.5rem' }}>
          {mutation.error.message}
        </div>
      )}
    </AntForm>
  );
}

