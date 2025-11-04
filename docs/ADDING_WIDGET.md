# Adding a Widget

## Checklist

1. **Add schema in api-contracts**
   - Create Zod schema in `kb-labs-api-contracts/packages/api-contracts/src/studio.ts`
   - Add stable alias: `.describe("kb.v1.studio.SchemaName")`
   - Export type and schema

2. **Update manifest (data.schema, options)**
   - Add widget to `manifest.v2.ts`
   - Set `data.schema` to schema reference
   - Define `options` type if needed

3. **Add component (BaseWidgetProps)**
   - Create widget component in `apps/studio/src/components/widgets/`
   - Use `BaseWidgetProps<T, O>` for props
   - Support `loading`, `error`, `data` states
   - Use `EmptyState`, `ErrorState`, `Skeleton` utilities

4. **Map kind (if new)**
   - Update `DEFAULT_COMPONENTS` in `plugin-adapter-studio/src/widgets.ts`
   - Update `WIDGET_COMPONENTS` in `widget-renderer.tsx`

5. **Snapshot tests + fixtures**
   - Create snapshot tests for loading/empty/error/data states
   - Add mock fixtures in `public/fixtures/`

6. **Gallery: add example**
   - Widget should appear in Gallery page automatically
   - Test with mock data

## Example

```typescript
// 1. Schema
export const MyWidgetSchema = z.object({
  id: z.string(),
  value: z.number(),
}).describe("kb.v1.studio.MyWidget");

// 2. Manifest
widgets: [{
  id: "my-plugin.my-widget",
  kind: "metric",
  title: "My Widget",
  data: {
    source: { type: "mock", fixtureId: "my-widget" },
    schema: { $ref: "kb.v1.studio.MyWidget" },
  },
  options: { showDelta: true },
}]

// 3. Component
export function MyWidget({ data, loading, error, options }: BaseWidgetProps<MyWidget, MyWidgetOptions>) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="No data" />;
  return <div>{data.value}</div>;
}
```


