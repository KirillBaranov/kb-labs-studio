# Оценка удобства текущего подхода для разработчиков

## Текущий подход

### Как это работает сейчас:

1. **Создание виджетов**:
```typescript
widgets: [
  {
    id: 'analytics.overview-summary',
    kind: 'keyvalue',
    title: 'Summary',
    data: { source: { type: 'rest', routeId: '/metrics', method: 'GET' } },
  },
  {
    id: 'analytics.overview-timeline',
    kind: 'chart',
    title: 'Timeline',
    data: { source: { type: 'rest', routeId: '/events-timeline', method: 'GET' } },
  },
]
```

2. **Создание layout с явным списком виджетов**:
```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    widgets: [
      'analytics.overview-summary',      // ← Нужно вручную указывать ID
      'analytics.overview-timeline',
      'analytics.overview-metrics',
    ],
  },
]
```

3. **Создание menu**:
```typescript
menus: [
  {
    id: 'analytics-overview',
    label: 'Analytics · Overview',
    target: '/plugins/analytics/overview',  // ← Конвенция: автоматически найдет layout analytics.overview
  },
]
```

## Проблемы текущего подхода

### ❌ Проблема 1: Ручное поддержание списка виджетов

**Проблема**: Нужно вручную синхронизировать ID виджетов между `widgets` и `layouts.widgets`.

**Пример проблемы**:
```typescript
// Виджет переименован
widgets: [
  { id: 'analytics.overview-summary-new' },  // ← Изменили ID
]

// Но забыли обновить layout
layouts: [
  {
    widgets: ['analytics.overview-summary'],  // ← Старый ID, виджет не найден!
  },
]
```

**Последствия**:
- Runtime ошибка: "No widgets found for layout"
- Нет compile-time проверки
- Легко допустить опечатку

### ❌ Проблема 2: Нет автодополнения и валидации

**Проблема**: TypeScript не знает, какие виджеты существуют.

**Пример**:
```typescript
layouts: [
  {
    widgets: [
      'analytics.non-existent-widget',  // ← TypeScript не предупредит!
      'typo-in-widget-id',              // ← Опечатка не обнаружена
    ],
  },
]
```

### ❌ Проблема 3: Неочевидна связь между menu и layout

**Проблема**: Не сразу понятно, что `target: '/plugins/analytics/overview'` автоматически найдет layout `analytics.overview`.

**Для нового разработчика**:
- Непонятно, нужно ли создавать layout
- Непонятно, как связаны menu target и layout ID
- Нет явной связи в коде

### ❌ Проблема 4: Дублирование информации

**Проблема**: ID виджета указывается дважды:
1. В определении виджета: `{ id: 'analytics.overview-summary' }`
2. В layout: `widgets: ['analytics.overview-summary']`

**Последствия**:
- Легко допустить опечатку
- Нет single source of truth

## Предложения по улучшению

### ✅ Вариант 1: TypeScript helpers для type-safe манифестов

**Идея**: Создать helper функции, которые обеспечивают type-safety.

```typescript
// helpers/manifest-helpers.ts
import type { ManifestV2 } from '@kb-labs/plugin-manifest';

export function createWidgets<T extends Record<string, { id: string }>>(
  widgets: T
): T {
  return widgets;
}

export function createLayout<
  TWidgets extends Record<string, { id: string }>,
  TWidgetIds extends keyof TWidgets
>(
  config: {
    id: string;
    kind: 'grid' | 'two-pane';
    widgets: TWidgetIds[];  // ← TypeScript проверит, что все ID существуют
  },
  widgets: TWidgets
) {
  return config;
}

// Использование:
const widgets = createWidgets({
  'overview-summary': {
    id: 'analytics.overview-summary',
    kind: 'keyvalue',
    // ...
  },
  'overview-timeline': {
    id: 'analytics.overview-timeline',
    kind: 'chart',
    // ...
  },
});

const layouts = [
  createLayout(
    {
      id: 'analytics.overview',
      kind: 'grid',
      widgets: ['overview-summary', 'overview-timeline'],  // ← TypeScript проверит!
    },
    widgets
  ),
];
```

**Плюсы**:
- ✅ Compile-time проверка
- ✅ Автодополнение в IDE
- ✅ Невозможно указать несуществующий виджет

**Минусы**:
- ⚠️ Более сложный API
- ⚠️ Нужно обернуть все в helpers

---

### ✅ Вариант 2: Группировка виджетов по layout

**Идея**: Виджеты определяются внутри layout, что делает связь явной.

```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    widgets: [
      {
        id: 'analytics.overview-summary',  // ← Виджет определен здесь
        kind: 'keyvalue',
        title: 'Summary',
        data: { source: { type: 'rest', routeId: '/metrics', method: 'GET' } },
      },
      {
        id: 'analytics.overview-timeline',
        kind: 'chart',
        title: 'Timeline',
        data: { source: { type: 'rest', routeId: '/events-timeline', method: 'GET' } },
      },
    ],
  },
]

// Глобальные виджеты (для переиспользования)
widgets: [
  {
    id: 'analytics.shared-metric',
    kind: 'metric',
    // ...
  },
]
```

**Плюсы**:
- ✅ Явная связь виджетов и layout
- ✅ Нет дублирования ID
- ✅ Легче понять структуру

**Минусы**:
- ⚠️ Нужно изменить структуру манифеста
- ⚠️ Виджеты нельзя переиспользовать между layouts (нужно выносить в глобальные)

---

### ✅ Вариант 3: Автоматическое определение виджетов по префиксу (гибрид)

**Идея**: Layout может использовать явный список ИЛИ автоматическое определение по префиксу.

```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    // Вариант A: явный список (для контроля)
    widgets: ['analytics.overview-summary', 'analytics.overview-timeline'],
    
    // ИЛИ вариант B: автоматическое определение (для простоты)
    widgetPrefix: 'analytics.overview-',  // ← Все виджеты с этим префиксом
  },
]
```

**Плюсы**:
- ✅ Гибкость: можно выбрать подход
- ✅ Простота для простых случаев (префикс)
- ✅ Контроль для сложных случаев (явный список)

**Минусы**:
- ⚠️ Два способа делают систему сложнее
- ⚠️ Нужно соглашение об именовании

---

### ✅ Вариант 4: Явная связь menu → layout

**Идея**: Menu явно указывает на layout ID.

```typescript
menus: [
  {
    id: 'analytics-overview',
    label: 'Analytics · Overview',
    target: '/plugins/analytics/overview',
    layoutId: 'analytics.overview',  // ← Явная связь
  },
]

layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    widgets: ['analytics.overview-summary', 'analytics.overview-timeline'],
  },
]
```

**Плюсы**:
- ✅ Явная связь menu → layout
- ✅ Легче понять структуру
- ✅ Можно использовать разные URL для одного layout

**Минусы**:
- ⚠️ Нужно указывать layoutId вручную
- ⚠️ Легко допустить опечатку

---

### ✅ Вариант 5: Runtime валидация с понятными ошибками

**Идея**: Добавить валидацию при загрузке манифеста с понятными сообщениями.

```typescript
// В Studio при загрузке манифеста:
function validateLayout(layout: StudioLayoutDecl, widgets: StudioWidgetDecl[]) {
  const errors: string[] = [];
  
  if (layout.widgets) {
    for (const widgetId of layout.widgets) {
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) {
        errors.push(
          `Layout "${layout.id}" references non-existent widget "${widgetId}". ` +
          `Available widgets: ${widgets.map(w => w.id).join(', ')}`
        );
      }
    }
  }
  
  return errors;
}
```

**Плюсы**:
- ✅ Понятные ошибки при загрузке
- ✅ Не нужно менять структуру манифеста
- ✅ Работает с текущим подходом

**Минусы**:
- ⚠️ Ошибки обнаруживаются только в runtime
- ⚠️ Нет compile-time проверки

---

## Рекомендации

### Краткосрочные улучшения (можно сделать сейчас):

1. **Добавить runtime валидацию** (Вариант 5)
   - Понятные ошибки при загрузке манифеста
   - Предупреждения о несуществующих виджетах

2. **Добавить документацию и примеры**
   - README с примерами
   - Шаблон манифеста
   - Troubleshooting guide

3. **Улучшить сообщения об ошибках**
   - Показывать доступные виджеты при ошибке
   - Предлагать похожие ID при опечатке

### Среднесрочные улучшения (следующий этап):

4. **Добавить TypeScript helpers** (Вариант 1)
   - Type-safe создание манифестов
   - Автодополнение в IDE

5. **Добавить явную связь menu → layout** (Вариант 4)
   - Поле `layoutId` в menu (опциональное, fallback на конвенцию)

### Долгосрочные улучшения (если понадобится):

6. **Поддержка автоматического определения по префиксу** (Вариант 3)
   - Для простых случаев
   - Опционально, как альтернатива явному списку

## Оценка текущего подхода

### Удобство: 6/10

**Плюсы**:
- ✅ Простая конвенция именования
- ✅ Явный список виджетов (понятно что будет на странице)
- ✅ Обратная совместимость

**Минусы**:
- ❌ Ручное поддержание списка виджетов
- ❌ Нет compile-time проверки
- ❌ Неочевидна связь menu → layout
- ❌ Легко допустить опечатку

### Что можно улучшить прямо сейчас:

1. **Добавить валидацию** - понятные ошибки при загрузке
2. **Добавить документацию** - примеры и best practices
3. **Улучшить ошибки** - показывать доступные виджеты

### Что добавить в будущем:

1. **TypeScript helpers** - для type-safety
2. **Явная связь menu → layout** - через поле `layoutId`

## Вывод

Текущий подход **работает**, но есть место для улучшения. Основная проблема - **отсутствие валидации и документации**. 

Рекомендую начать с:
1. Runtime валидации с понятными ошибками
2. Документации с примерами
3. TypeScript helpers для type-safety (если команда использует TypeScript)

Это сделает подход более удобным для разработчиков без кардинальных изменений архитектуры.

