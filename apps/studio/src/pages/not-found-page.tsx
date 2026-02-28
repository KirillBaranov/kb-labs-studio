import { useNavigate } from 'react-router-dom';
import { UIResult, UISpace, UIButton, UIIcon } from '@kb-labs/studio-ui-kit';

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
      <UIResult
        status="404"
        title="404"
        subTitle="Страница не найдена"
        extra={
          <UISpace size="middle">
            <UIButton
              variant="primary"
              icon={<UIIcon name="HomeOutlined" />}
              onClick={() => navigate('/')}
            >
              На главную
            </UIButton>
            <UIButton
              icon={<UIIcon name="ArrowLeftOutlined" />}
              onClick={() => navigate(-1)}
            >
              Назад
            </UIButton>
          </UISpace>
        }
      />
    </div>
  );
}

