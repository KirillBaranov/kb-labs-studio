import { useNavigate } from 'react-router-dom';
import { Result, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { KBButton } from '@kb-labs/studio-ui-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: 24,
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Страница не найдена"
        extra={
          <Space size="middle">
            <KBButton
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              На главную
            </KBButton>
            <KBButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Назад
            </KBButton>
          </Space>
        }
      />
    </div>
  );
}

