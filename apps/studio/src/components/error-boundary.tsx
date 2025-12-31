/**
 * @module @kb-labs/studio-app/components/ErrorBoundary
 * Custom error boundary for React Router with friendly UI
 */

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Result, Button, Card, Typography, Space } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

export function ErrorBoundary() {
  const error = useRouteError();

  let title = 'Упс! Что-то пошло не так';
  let description = 'Произошла непредвиденная ошибка';
  let status: 'error' | 'warning' | '404' | '500' | 'info' = 'error';
  let suggestion = 'Попробуйте перезагрузить страницу или вернуться на главную';

  if (isRouteErrorResponse(error)) {
    // React Router error response
    if (error.status === 404) {
      status = '404';
      title = 'Страница не найдена';
      description = 'К сожалению, запрошенная страница не существует';
      suggestion = 'Проверьте адрес или вернитесь на главную страницу';
    } else {
      status = '500';
      title = `Ошибка ${error.status}`;
      description = error.statusText || error.data?.message || description;
    }
  } else if (error instanceof Error) {
    // JavaScript error
    description = error.message;

    // Friendly message for common errors
    if (error.message.includes('Unsupported data source')) {
      title = 'Ошибка конфигурации виджета';
      description = 'Виджет имеет некорректную настройку источника данных';
      suggestion = 'Это ошибка в манифесте плагина. Обратитесь к разработчику.';
      status = 'warning';
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      title = 'Ресурс не найден';
      description = 'Запрошенный ресурс не существует';
      suggestion = 'Проверьте настройки плагина или обратитесь к администратору';
      status = '404';
    } else if (error.message.includes('Failed to fetch')) {
      title = 'Ошибка сети';
      description = 'Не удалось подключиться к серверу';
      suggestion = 'Проверьте подключение к интернету и попробуйте снова';
      status = 'warning';
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          maxWidth: '600px',
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        bodyStyle={{ padding: '3rem' }}
      >
        <Result
          status={status}
          title={<span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{title}</span>}
          subTitle={
            <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '1rem' }}>
              <Paragraph style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                {description}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                💡 {suggestion}
              </Text>
            </Space>
          }
          extra={
            <Space size="middle" style={{ marginTop: '1.5rem' }}>
              <Link to="/">
                <Button type="primary" size="large" icon={<HomeOutlined />}>
                  На главную
                </Button>
              </Link>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Перезагрузить
              </Button>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
