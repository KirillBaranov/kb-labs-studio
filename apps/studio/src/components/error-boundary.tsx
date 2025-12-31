/**
 * @module @kb-labs/studio-app/components/ErrorBoundary
 * Custom error boundary for React Router with friendly UI
 */

import * as React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Result, Button, Card, Typography, Space, Collapse, Tag, message } from 'antd';
import { HomeOutlined, ReloadOutlined, BugOutlined, CodeOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

export function ErrorBoundary() {
  const error = useRouteError();
  const [copied, setCopied] = React.useState(false);

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

  // Extract error details
  const errorDetails = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : null;

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
          maxWidth: '800px',
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
            <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '1.5rem' }}>
              <Space size="middle">
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

              {/* Error Details Collapse */}
              {errorDetails && (
                <Collapse
                  ghost
                  style={{ width: '100%', textAlign: 'left' }}
                  items={[
                    {
                      key: 'details',
                      label: (
                        <Space>
                          <BugOutlined />
                          <Text strong>Детали ошибки (для разработчиков)</Text>
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {/* Error Type */}
                          <div>
                            <Text type="secondary" style={{ fontSize: '0.75rem' }}>Тип ошибки:</Text>
                            <div style={{ marginTop: 4 }}>
                              <Tag color="red" icon={<CodeOutlined />}>
                                {errorDetails.name}
                              </Tag>
                            </div>
                          </div>

                          {/* Error Message */}
                          <div>
                            <Text type="secondary" style={{ fontSize: '0.75rem' }}>Сообщение:</Text>
                            <div
                              style={{
                                marginTop: 4,
                                padding: '12px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                wordBreak: 'break-word',
                              }}
                            >
                              <Text code>{errorDetails.message}</Text>
                            </div>
                          </div>

                          {/* Stack Trace */}
                          {errorDetails.stack && (
                            <div>
                              <Text type="secondary" style={{ fontSize: '0.75rem' }}>Stack Trace:</Text>
                              <div
                                style={{
                                  marginTop: 4,
                                  padding: '12px',
                                  background: '#1e1e1e',
                                  borderRadius: '8px',
                                  maxHeight: '300px',
                                  overflow: 'auto',
                                }}
                              >
                                <pre
                                  style={{
                                    margin: 0,
                                    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                                    fontSize: '0.75rem',
                                    lineHeight: 1.5,
                                    color: '#d4d4d4',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {errorDetails.stack}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Copy to Clipboard */}
                          <Button
                            size="small"
                            type={copied ? 'primary' : 'default'}
                            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={() => {
                              const text = `${errorDetails.name}: ${errorDetails.message}\n\n${errorDetails.stack || 'No stack trace'}`;
                              navigator.clipboard.writeText(text);
                              setCopied(true);
                              message.success('Ошибка скопирована в буфер обмена');
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            {copied ? 'Скопировано!' : 'Скопировать в буфер обмена'}
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}
            </Space>
          }
        />
      </Card>
    </div>
  );
}
