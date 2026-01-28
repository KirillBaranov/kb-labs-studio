import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface DashboardEmptyProps {
  onAddWidget: () => void;
}

export function DashboardEmpty({ onAddWidget }: DashboardEmptyProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <Empty
        description="No widgets added yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddWidget}>
          Add Widget
        </Button>
      </Empty>
    </div>
  );
}
