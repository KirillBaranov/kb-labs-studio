# Варианты доработки Studio для упрощения работы с плагинами

## Проблема

Сейчас Studio требует явного указания виджета в URL (`/plugins/analytics/overview`), но плагины хотят просто указать:
- Menu target → Layout
- Layout → список виджетов

Studio должен быть "тупой песочницей", где плагины просто задают структуру и получают готовую страницу.

## Варианты решения

### Вариант 1: Layout-first подход (Рекомендуемый)

**Идея**: Menu target указывает на layout ID, Studio автоматически рендерит все виджеты плагина, которые соответствуют этому layout.

**Изменения в манифесте**:
```typescript
menus: [
  {
    id: 'analytics-overview',
    label: 'Analytics · Overview',
    target: '/plugins/analytics/overview',  // URL
    layoutId: 'analytics.overview',  // ← Новое поле: указывает на layout
    order: 0,
  },
]

layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    config: { cols: { sm: 1, md: 2, lg: 3 }, rowHeight: 10 },
    // Виджеты определяются автоматически по префиксу ID
    // Все виджеты с ID вида analytics.overview-* будут включены
  },
]
```

**Изменения в Studio**:
1. `plugin-page.tsx` проверяет, есть ли layout для этого пути
2. Если layout найден, рендерит все виджеты плагина с соответствующим префиксом
3. Если layout не найден, работает как сейчас (ищет виджет)

**Плюсы**:
- ✅ Просто для плагинов: просто указываешь layoutId
- ✅ Гибко: можно добавлять виджеты без изменения layout
- ✅ Обратная совместимость: старые плагины работают как раньше

**Минусы**:
- ⚠️ Нужно соглашение об именовании виджетов (префикс)

---

### Вариант 2: Явный список виджетов в layout

**Идея**: Layout содержит явный список виджетов, которые нужно рендерить.

**Изменения в манифесте**:
```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    config: { cols: { sm: 1, md: 2, lg: 3 }, rowHeight: 10 },
    widgets: [  // ← Явный список виджетов
      'analytics.overview-summary',
      'analytics.overview-timeline',
      'analytics.overview-metrics',
    ],
  },
]
```

**Изменения в Studio**:
1. Расширить `StudioLayoutDecl` типом, добавив поле `widgets?: string[]`
2. `plugin-page.tsx` находит layout по menu target
3. Рендерит все виджеты из списка `widgets`

**Плюсы**:
- ✅ Явно и понятно: видно точно, какие виджеты будут показаны
- ✅ Полный контроль: можно указать порядок и какие виджеты включить

**Минусы**:
- ⚠️ Нужно обновлять layout при добавлении виджетов
- ⚠️ Нужно изменить типы в `@kb-labs/plugin-manifest`

---

### Вариант 3: Комбинированный подход (Гибрид)

**Идея**: Layout может содержать явный список виджетов ИЛИ использовать автоматическое определение по префиксу.

**Изменения в манифесте**:
```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    config: { cols: { sm: 1, md: 2, lg: 3 }, rowHeight: 10 },
    // Вариант A: явный список
    widgets: ['analytics.overview-summary', 'analytics.overview-timeline'],
    // ИЛИ вариант B: автоматическое определение по префиксу
    widgetPrefix: 'analytics.overview-',
  },
]
```

**Плюсы**:
- ✅ Максимальная гибкость
- ✅ Можно использовать оба подхода в зависимости от ситуации

**Минусы**:
- ⚠️ Более сложная логика в Studio
- ⚠️ Может быть избыточно для простых случаев

---

### Вариант 4: Menu target → Layout mapping через конвенцию

**Идея**: Studio автоматически определяет layout по конвенции именования.

**Конвенция**:
- Menu target: `/plugins/analytics/overview` → Layout ID: `analytics.overview`
- Menu target: `/plugins/analytics/events` → Layout ID: `analytics.events`

**Изменения в манифесте**:
```typescript
menus: [
  {
    id: 'analytics-overview',
    label: 'Analytics · Overview',
    target: '/plugins/analytics/overview',  // Studio автоматически найдет layout analytics.overview
    order: 0,
  },
]

layouts: [
  {
    id: 'analytics.overview',  // ← Автоматически сопоставляется с /plugins/analytics/overview
    kind: 'grid',
    title: 'Analytics Overview',
    config: { cols: { sm: 1, md: 2, lg: 3 }, rowHeight: 10 },
  },
]
```

**Изменения в Studio**:
1. `plugin-page.tsx` извлекает `pluginId` и `pageName` из URL
2. Ищет layout с ID `{pluginId}.{pageName}`
3. Если найден, рендерит все виджеты плагина с префиксом `{pluginId}.{pageName}-`

**Плюсы**:
- ✅ Минимальные изменения в манифесте
- ✅ Просто и понятно: конвенция именования
- ✅ Не нужно указывать layoutId в menu

**Минусы**:
- ⚠️ Жесткая конвенция: нужно следовать правилам именования

---

## Рекомендация

**Рекомендую Вариант 4 (конвенция) + Вариант 2 (явный список виджетов)**:

1. **Конвенция для определения layout**: `/plugins/{pluginId}/{pageName}` → layout `{pluginId}.{pageName}`
2. **Явный список виджетов в layout**: `widgets: string[]` для полного контроля

Это даст:
- ✅ Простоту для плагинов (конвенция)
- ✅ Гибкость при необходимости (явный список)
- ✅ Обратную совместимость (fallback на поиск виджета)

## План реализации

1. **Обновить типы** (`@kb-labs/plugin-manifest`):
   - Добавить `widgets?: string[]` в `StudioLayoutDecl`

2. **Обновить Studio** (`plugin-page.tsx`):
   - Добавить логику поиска layout по конвенции
   - Добавить рендеринг layout с виджетами
   - Сохранить fallback на текущее поведение

3. **Обновить манифест analytics**:
   - Добавить `widgets` в layouts

4. **Тестирование**:
   - Проверить работу с новыми и старыми плагинами

---

## Ответы на вопросы

### ✅ Можно ли создавать разные страницы?

**Да, можно!** Сейчас это работает через menu targets:

```typescript
menus: [
  {
    id: 'analytics-overview',
    label: 'Analytics · Overview',
    target: '/plugins/analytics/overview',  // ← Разные страницы через разные targets
    order: 0,
  },
  {
    id: 'analytics-events',
    label: 'Analytics · Events',
    target: '/plugins/analytics/events',  // ← Другая страница
    order: 1,
  },
]
```

После реализации доработки каждая страница будет автоматически использовать соответствующий layout:
- `/plugins/analytics/overview` → layout `analytics.overview`
- `/plugins/analytics/events` → layout `analytics.events`
- `/plugins/analytics/performance` → layout `analytics.performance`

### ✅ Можно ли добавить кнопки/действия/модалки в будущем?

**Да, можно!** Есть несколько путей:

#### Вариант A: Custom компоненты (уже работает)

Плагины могут создавать свои React компоненты с полным контролем:

```typescript
widgets: [
  {
    id: 'analytics.custom-action',
    kind: 'custom',  // или любой другой kind
    title: 'Custom Widget',
    component: './widgets/CustomWidget.tsx#CustomWidget',  // ← Custom компонент
    data: { source: { type: 'rest', routeId: '/events', method: 'GET' } },
  },
]
```

В `CustomWidget.tsx` можно:
- Использовать любые UI библиотеки (Ant Design уже есть)
- Добавлять кнопки, модалки, формы
- Вызывать REST API через `useWidgetData` hook
- Использовать контекст Studio

#### Вариант B: Расширение стандартных виджетов (предлагается)

Добавить поддержку действий в стандартные виджеты:

```typescript
widgets: [
  {
    id: 'analytics.events-table',
    kind: 'table',
    title: 'Events',
    data: { source: { type: 'rest', routeId: '/events', method: 'GET' } },
    actions: [  // ← Новое поле
      {
        id: 'refresh',
        label: 'Refresh',
        icon: 'refresh',
        type: 'button',
        handler: { type: 'rest', routeId: '/events', method: 'POST' },
      },
      {
        id: 'export',
        label: 'Export',
        icon: 'download',
        type: 'button',
        handler: { type: 'rest', routeId: '/events/export', method: 'GET' },
      },
      {
        id: 'filter',
        label: 'Filter',
        icon: 'filter',
        type: 'modal',
        component: './modals/FilterModal.tsx#FilterModal',
      },
    ],
  },
]
```

#### Вариант C: Глобальные действия в layout (предлагается)

Добавить действия на уровне layout (например, кнопки в header страницы):

```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    config: { cols: { sm: 1, md: 2, lg: 3 }, rowHeight: 10 },
    widgets: ['analytics.overview-summary', 'analytics.overview-timeline'],
    actions: [  // ← Действия на уровне страницы
      {
        id: 'export-all',
        label: 'Export All',
        type: 'button',
        handler: { type: 'rest', routeId: '/export', method: 'GET' },
      },
      {
        id: 'settings',
        label: 'Settings',
        type: 'modal',
        component: './modals/SettingsModal.tsx#SettingsModal',
      },
    ],
  },
]
```

## Рекомендации по расширению

### Фаза 1: Layout-first подход (текущая задача)
- ✅ Реализовать поддержку layouts
- ✅ Добавить `widgets?: string[]` в layout

### Фаза 2: Базовые действия (будущее)
- Добавить `actions?: WidgetAction[]` в виджеты
- Поддержать типы: `button`, `link`, `dropdown`
- Обработчики: REST API вызовы, навигация

### Фаза 3: Интерактивность (будущее)
- Добавить поддержку модалок через `type: 'modal'`
- Добавить формы через `type: 'form'`
- Добавить контекстные меню через `type: 'context-menu'`

### Фаза 4: Глобальные действия (будущее)
- Добавить `actions?: LayoutAction[]` в layouts
- Рендерить действия в header страницы
- Поддержать глобальные модалки и уведомления

## Примеры использования

### Пример 1: Таблица с действиями

```typescript
{
  id: 'analytics.events-table',
  kind: 'table',
  title: 'Events',
  data: { source: { type: 'rest', routeId: '/events', method: 'GET' } },
  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh',
      type: 'button',
      handler: { type: 'refresh' },  // Перезагрузить данные виджета
    },
    {
      id: 'export',
      label: 'Export CSV',
      icon: 'download',
      type: 'button',
      handler: { type: 'rest', routeId: '/events/export', method: 'GET', download: true },
    },
  ],
}
```

### Пример 2: Виджет с модалкой

```typescript
{
  id: 'analytics.filter-panel',
  kind: 'panel',
  title: 'Filters',
  data: { source: { type: 'rest', routeId: '/filters', method: 'GET' } },
  actions: [
    {
      id: 'edit-filters',
      label: 'Edit Filters',
      icon: 'edit',
      type: 'modal',
      component: './modals/FilterModal.tsx#FilterModal',
      props: {  // Пропсы для модалки
        widgetId: 'analytics.filter-panel',
        onSave: { type: 'rest', routeId: '/filters', method: 'POST' },
      },
    },
  ],
}
```

### Пример 3: Layout с глобальными действиями

```typescript
layouts: [
  {
    id: 'analytics.overview',
    kind: 'grid',
    title: 'Analytics Overview',
    widgets: ['analytics.overview-summary', 'analytics.overview-timeline'],
    actions: [
      {
        id: 'export-report',
        label: 'Export Report',
        icon: 'file-export',
        type: 'button',
        handler: { type: 'rest', routeId: '/export/report', method: 'GET' },
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        type: 'modal',
        component: './modals/SettingsModal.tsx#SettingsModal',
      },
    ],
  },
]
```

## Выводы

✅ **Разные страницы**: Уже работают через menu targets, после доработки будут автоматически использовать layouts

✅ **Кнопки/действия/модалки**: 
- **Сейчас**: Можно через custom компоненты (полный контроль)
- **Будущее**: Можно добавить стандартизированные действия через расширение типов

✅ **Рекомендация**: 
1. Сначала реализовать layout-first подход (текущая задача)
2. Потом добавить поддержку действий в виджеты (фаза 2)
3. Затем добавить глобальные действия в layouts (фаза 3)

