# Widget Events API

Система событий позволяет виджетам общаться друг с другом на уровне страницы.

## Использование в виджете

### Вариант 1: Через props (рекомендуется)

Виджеты автоматически получают `emitEvent` и `subscribeToEvent` через props:

```typescript
import type { BaseWidgetProps } from './types';

export function MyWidget({ 
  data, 
  emitEvent, 
  subscribeToEvent 
}: BaseWidgetProps<MyData>) {
  // Подписка на событие
  React.useEffect(() => {
    if (!subscribeToEvent) return;
    
    const unsubscribe = subscribeToEvent('my-custom-event', (payload) => {
      console.log('Received event:', payload);
      // Обработка события
    });

    return unsubscribe; // Важно: отписаться при unmount
  }, [subscribeToEvent]);

  // Отправка события
  const handleClick = () => {
    emitEvent?.('my-custom-event', {
      timestamp: Date.now(),
      data: data,
    });
  };

  return <button onClick={handleClick}>Send Event</button>;
}
```

### Вариант 2: Через хук useWidgetEvents

Для более сложных случаев можно использовать хук напрямую:

```typescript
import { useWidgetEvents } from '../../hooks/useWidgetEvents';

export function MyWidget({ data }: BaseWidgetProps<MyData>) {
  const { subscribe, emit } = useWidgetEvents();

  React.useEffect(() => {
    const unsubscribe = subscribe('my-event', (payload) => {
      // обработка
    });
    return unsubscribe;
  }, [subscribe]);

  const handleClick = () => {
    emit('my-event', { data });
  };

  return <button onClick={handleClick}>Send</button>;
}
```

## Автоматическая подписка через манифест

В манифесте можно указать события, на которые виджет должен подписаться:

```yaml
studio:
  widgets:
    - id: my-widget
      kind: table
      title: My Widget
      events:
        subscribe:
          - widget:refresh
          - widget:filter
          - my-custom-event
        emit:
          - widget:data-updated
          - my-custom-event
```

Виджет автоматически подпишется на события из `events.subscribe`.

## Стандартные события

- `widget:refresh` - запрос на обновление данных виджета
- `widget:filter` - применение фильтра
- `widget:select` - выбор элемента
- `widget:data-updated` - данные обновлены

## Примеры использования

### Отправка события самому себе

```typescript
export function MyWidget({ emitEvent, subscribeToEvent }: BaseWidgetProps) {
  React.useEffect(() => {
    if (!subscribeToEvent) return;
    
    const unsubscribe = subscribeToEvent('self-update', (payload) => {
      console.log('Self event received:', payload);
    });

    return unsubscribe;
  }, [subscribeToEvent]);

  const handleSelfEvent = () => {
    emitEvent?.('self-update', { message: 'Hello self!' });
  };

  return <button onClick={handleSelfEvent}>Send to Self</button>;
}
```

### Коммуникация между виджетами

**Widget A (отправитель):**
```typescript
export function WidgetA({ emitEvent }: BaseWidgetProps) {
  const handleUpdate = () => {
    emitEvent?.('data-updated', { source: 'widget-a', timestamp: Date.now() });
  };
  
  return <button onClick={handleUpdate}>Update Data</button>;
}
```

**Widget B (получатель):**
```typescript
export function WidgetB({ subscribeToEvent }: BaseWidgetProps) {
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!subscribeToEvent) return;
    
    const unsubscribe = subscribeToEvent('data-updated', (payload: any) => {
      console.log('Data updated by:', payload.source);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [subscribeToEvent]);

  return <div>Last update: {lastUpdate?.toLocaleTimeString()}</div>;
}
```

## Важные замечания

1. **Отписка обязательна**: Всегда вызывайте функцию unsubscribe в cleanup useEffect
2. **Scope**: События работают только на уровне страницы (page-level)
3. **Типизация**: Используйте TypeScript для типизации payload
4. **Производительность**: Не подписывайтесь на события в render цикле

