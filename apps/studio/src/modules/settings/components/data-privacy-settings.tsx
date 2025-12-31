import * as React from 'react';
import { Button, Space, Typography, message, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useSettings } from '@/providers/settings-provider';

const { Text, Paragraph, Title } = Typography;

export function DataPrivacySettings() {
  const { exportSettings, importSettings, resetSettings } = useSettings();

  const handleExport = () => {
    try {
      exportSettings();
      message.success('Settings exported successfully');
    } catch (error) {
      message.error(`Failed to export settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleImport: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importSettings(content);
        message.success('Settings imported successfully');
      } catch (error) {
        message.error(`Failed to import settings: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This will reset all settings to defaults.')) {
      try {
        resetSettings();
        localStorage.clear();
        message.success('All local data cleared successfully');
      } catch (error) {
        message.error(`Failed to clear data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Export Settings */}
      <div>
        <Title level={5} style={{ marginBottom: 8 }}>
          Export Settings
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          Download your current settings as a JSON file. You can use this to backup your preferences
          or transfer them to another device.
        </Paragraph>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExport}
          type="default"
        >
          Export Settings
        </Button>
      </div>

      {/* Import Settings */}
      <div>
        <Title level={5} style={{ marginBottom: 8 }}>
          Import Settings
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          Restore your settings from a previously exported JSON file. This will overwrite your current settings.
        </Paragraph>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <Button icon={<UploadOutlined />}>
            Import Settings
          </Button>
        </Upload>
      </div>

      {/* Clear Local Data */}
      <div>
        <Title level={5} style={{ marginBottom: 8 }}>
          Clear Local Data
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          Clear all locally stored data including settings, cache, and preferences.
          This will reset the application to its default state.
        </Paragraph>
        <Button
          icon={<DeleteOutlined />}
          onClick={handleClearData}
          type="primary"
          danger
        >
          Clear All Data
        </Button>
      </div>
    </Space>
  );
}
