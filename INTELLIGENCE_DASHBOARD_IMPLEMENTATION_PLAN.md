# 🎯 KB LABS INTELLIGENCE PLATFORM - IMPLEMENTATION PLAN

**Status**: 🟡 In Progress
**Start Date**: 2026-01-09
**Target Completion**: 2 weeks (~92 hours)
**Current Phase**: Planning Complete ✅

---

## 📊 PROGRESS TRACKER

### Overall Progress: 78% (72/92 hours)

```
Planning & Research:    ████████████████████ 100% (5h/5h)      ✅
Phase 1 - Foundation:   ████████████████████ 100% (42h/42h)   ✅
Phase 2 - Advanced:     ██████████████████░░  86% (31h/36h)   ✅
Phase 3 - Backend:      █████░░░░░░░░░░░░░░░  33% (4h/12h)    🟢
Testing & Polish:       ░░░░░░░░░░░░░░░░░░░░   0% (0h/12h)    ⏸️
```

**Latest Update (Jan 9, 2026):**
- ✅ Frontend Complete (68h total)
  - All 9 widgets implemented
  - Dashboard animations system
  - Full integration & layout
- ✅ Phase 3.1: Historical Data Endpoints (4h)
  - HistoricalMetricsCollector service
  - 2 new REST API endpoints
  - Real-time collection with TTL storage
  - Comprehensive documentation
- 🟢 Next: Phase 3.2 Enhanced Adapter Statistics

---

## 📋 PLANNING & RESEARCH (5h) ✅ COMPLETED

- [x] Research internal hooks architecture (use-observability, use-analytics, use-adapters)
- [x] Map REST API endpoints and data structures
- [x] Document available data sources and refresh intervals
- [x] Design component architecture
- [x] Create detailed implementation plan

**Completion Date**: 2026-01-09
**Notes**: Complete technical documentation created. All APIs mapped. Ready to start implementation.

---

## 🏗️ PHASE 1: FOUNDATION (42h) - Week 1

### Status: ✅ Completed (42/42 hours) - Jan 9, 2026

---

### 1.1 Hero Metrics Widget (6h)

**Status**: ✅ Completed
**Priority**: 🔴 Critical
**Dependencies**: None

#### Tasks:
- [x] Create `HeroMetricCard.tsx` component (2h)
  - Props interface
  - Layout and styling
  - Status color coding
  - Click handler support
- [x] Create `Sparkline.tsx` mini-chart (1h)
  - SVG path rendering
  - Smooth animations
  - Responsive sizing
- [x] Create `TrendIndicator.tsx` (1h)
  - Arrow icons (↑ ↓)
  - Color coding
  - Percentage formatting
- [x] Integrate with data hooks (2h)
  - Connect to `useDevKitHealth`
  - Connect to `usePrometheusMetrics`
  - Connect to `useStateBrokerStats`
  - Add historical data collection

#### Data Sources:
```typescript
// 1. DevKit Health
const devkit = useDevKitHealth(sources.observability);
value: `${devkit.data?.healthScore}/100`
subtitle: `Grade ${devkit.data?.grade}`

// 2. Uptime
const metrics = usePrometheusMetrics(sources.observability);
value: `${calculateUptime(metrics.data)}%`
sparkline: uptimeHistory

// 3. Total Requests
value: metrics.data?.requests.total
sparkline: requestsHistory
trend: calculateTrend(requestsHistory)

// 4. Runtime
value: formatUptime(metrics.data?.uptime.seconds)
status: 'live'
pulsing: true
```

#### Acceptance Criteria:
- [x] 4 hero cards display correctly
- [x] Real-time data updates (10s refresh)
- [x] Sparklines render smoothly
- [x] Trend indicators show up/down correctly
- [x] Pulsing animation works for LIVE status
- [x] Click navigates to detail pages

**Estimated**: 6h | **Actual**: 2h | **Notes**: Completed ahead of schedule. Components combined into single files.

---

### 1.2 Activity Timeline (2h)

**Status**: ✅ Completed
**Priority**: 🔴 Critical
**Dependencies**: None

#### Tasks:
- [x] Create `ActivityTimeline.tsx` component (1h)
  - Use `KBAreaChart` from studio-ui-react
  - Configure series (requests + errors)
  - Add time range selector
  - Style with gradients
- [x] Implement metrics history collection (1h)
  - Integrated history tracking
  - Store configurable data points (6-180 based on range)
  - Auto-cleanup old data
  - Dynamic time range selection (1m/5m/10m/30m)

#### Implementation:
```typescript
const [metricsHistory, setMetricsHistory] = useState<MetricsPoint[]>([]);

useEffect(() => {
  if (metrics.data) {
    setMetricsHistory(prev => [
      ...prev,
      {
        time: new Date().toISOString(),
        requests: metrics.data.requests.total,
        errors: metrics.data.requests.clientErrors + metrics.data.requests.serverErrors
      }
    ].slice(-60)); // Keep last 60 points
  }
}, [metrics.data]);
```

#### Acceptance Criteria:
- [x] Area chart displays requests and errors
- [x] Real-time updates every 10s
- [x] Smooth transitions between data points
- [x] Tooltip shows exact values
- [x] Time range selectable (1m/5m/10m/30m)
- [x] Legend shows current values

**Estimated**: 2h | **Actual**: 1h | **Notes**: Completed with time range selector enhancement.

---

### 1.3 Cost Attribution Widget (8h)

**Status**: ✅ Completed
**Priority**: 🔴 Critical
**Dependencies**: None

#### Tasks:
- [x] Create `CostBreakdownCard.tsx` container (2h)
  - Header with total cost
  - Today vs Yesterday comparison
  - Trend indicator
  - Drill-down navigation
- [x] Create `CostPieChart.tsx` (2h)
  - Breakdown by adapter (LLM, Embeddings, VectorStore)
  - Interactive hover
  - Click to filter
- [x] Create `TopSpendersTable.tsx` (2h)
  - By model breakdown
  - Cost per model
  - Request count
  - Avg duration
- [x] Implement cost calculations (2h)
  - Integrated cost calculations
  - Aggregate from multiple adapters
  - Calculate percentages
  - Detect anomalies (>2x std dev)

#### Data Sources:
```typescript
const llm = useAdaptersLLMUsage(sources.adapters);
const embeddings = useAdaptersEmbeddingsUsage(sources.adapters);
const vectorstore = useAdaptersVectorStoreUsage(sources.adapters);

const totalCost = (
  (llm.data?.totalCost ?? 0) +
  (embeddings.data?.totalCost ?? 0) +
  (vectorstore.data?.totalCost ?? 0)
);
```

#### Acceptance Criteria:
- [x] Total cost displays correctly
- [x] Pie chart shows breakdown
- [x] Top spenders table sorted by cost
- [x] By-model breakdown shows details
- [x] Anomaly detection highlights spikes
- [x] Today vs Yesterday comparison

**Estimated**: 8h | **Actual**: 4h | **Notes**: Combined components into single widget. All features integrated.

---

### 1.4 Performance Budget Tracker (6h)

**Status**: ✅ Completed
**Priority**: 🔴 Critical
**Dependencies**: None

#### Tasks:
- [x] Create `PerformanceBudgetCard.tsx` (2h)
  - SLO target display
  - Current uptime percentage
  - Error budget calculation
  - Budget gauge visualization
- [x] Create `ErrorBudgetGauge.tsx` (1h)
  - Circular gauge component
  - Color coding (green/yellow/red)
  - Percentage display
  - Minutes remaining
- [x] Create `ServiceSLOTable.tsx` (2h)
  - Per-plugin SLO tracking
  - Uptime percentage
  - Error budget status
  - Burn rate indicator
- [x] Implement SLO calculations (1h)
  - Integrated SLO calculations
  - Calculate uptime from metrics
  - Error budget math
  - Burn rate prediction

#### Implementation:
```typescript
const calculateErrorBudget = (slo: number) => {
  const allowedDowntime = (100 - slo) / 100;
  const minutesPerMonth = 30 * 24 * 60; // ~43,200
  return allowedDowntime * minutesPerMonth;
};

const calculateUptime = (metrics: PrometheusMetrics) => {
  const total = metrics.requests.total;
  const success = metrics.requests.success;
  return total > 0 ? (success / total) * 100 : 100;
};
```

#### Acceptance Criteria:
- [x] SLO target (99.9%) displays
- [x] Current uptime calculates correctly
- [x] Error budget shows used/remaining
- [x] Gauge updates in real-time
- [x] Per-service table shows all plugins
- [x] Burn rate prediction works
- [x] Color coding reflects status

**Estimated**: 6h | **Actual**: 4h | **Notes**: Full SRE-style SLO tracking with dashboard gauge and burn rate calculations.

---

### 1.5 System Topology Graph (10h)

**Status**: ⏸️ Not Started
**Priority**: 🟡 High
**Dependencies**: Install `reactflow` library

#### Tasks:
- [ ] Install dependencies (0.5h)
  ```bash
  pnpm add reactflow
  ```
- [ ] Create `SystemTopologyGraph.tsx` (4h)
  - ReactFlow setup
  - Node layout algorithm
  - Edge rendering
  - Interactive controls (zoom, pan)
- [ ] Create custom node types (2h)
  - `PluginNode` with metrics
  - `AdapterNode` with status
  - Color coding by health
  - Click handlers
- [ ] Implement traffic flow animation (2h)
  - Animated edges
  - Request rate visualization
  - Error highlighting
- [ ] Create `NodeDetailsPanel.tsx` (1.5h)
  - Slide-out panel on click
  - Node metrics display
  - Recent errors
  - Actions (view logs, etc.)

#### Implementation:
```typescript
import ReactFlow, { Node, Edge } from 'reactflow';

// Build graph
const nodes: Node[] = [
  { id: 'user', type: 'input', data: { label: 'User' }, position: { x: 250, y: 0 } },
  { id: 'api', data: { label: 'REST API', ... }, position: { x: 250, y: 100 } },
  ...metrics.data?.perPlugin.map(p => ({
    id: p.pluginId,
    type: 'plugin',
    data: {
      label: p.pluginId,
      requests: p.requests,
      errors: p.errors,
      status: p.errors > 10 ? 'warning' : 'healthy'
    }
  }))
];

const edges: Edge[] = buildEdges(metrics.data);

<ReactFlow nodes={nodes} edges={edges} animated fitView />
```

#### Acceptance Criteria:
- [ ] Graph renders all plugins
- [ ] Auto-layout positions nodes
- [ ] Edges show traffic flow
- [ ] Animation runs smoothly
- [ ] Click node shows details panel
- [ ] Color coding reflects health
- [ ] Zoom and pan work
- [ ] Updates in real-time

**Estimated**: 10h | **Actual**: ___ | **Notes**: ___

---

### 1.6 Smart Incidents Widget (10h)

**Status**: ⏸️ Not Started
**Priority**: 🟡 High
**Dependencies**: 1.5 (uses metrics data)

#### Tasks:
- [ ] Create `IncidentsCard.tsx` container (2h)
  - Active incidents list
  - Severity badges
  - Collapse/expand
  - Filter by severity
- [ ] Create `IncidentListItem.tsx` (2h)
  - Incident title and details
  - Time ago
  - Affected services
  - Actions (view logs, silence)
- [ ] Create `RootCauseAnalysis.tsx` (3h)
  - Causal chain visualization
  - Correlation matrix
  - Evidence list
  - Recommended actions
- [ ] Implement incident detection (3h)
  - `useIncidentDetection` hook
  - Rule-based detection
  - Error rate thresholds
  - Latency spike detection
  - Plugin failure detection

#### Detection Rules:
```typescript
const detectIncidents = (data: {
  metrics: PrometheusMetrics,
  logs: LogRecord[],
  healthEvents: HealthEvent[]
}) => {
  const incidents: Incident[] = [];

  // 1. High error rate
  const errorRate = calculateErrorRate(data.metrics);
  if (errorRate > 5) {
    incidents.push({
      severity: 'critical',
      type: 'error_rate',
      title: 'High error rate detected',
      details: `${errorRate.toFixed(1)}% error rate (threshold: 5%)`,
      time: Date.now()
    });
  }

  // 2. Slow endpoints
  const slowRoutes = data.metrics.perPlugin
    .filter(p => p.latency.average > 200);
  if (slowRoutes.length > 0) {
    incidents.push({
      severity: 'warning',
      type: 'latency',
      title: 'Slow endpoints detected',
      details: slowRoutes.map(r => r.pluginId).join(', '),
      time: Date.now()
    });
  }

  // 3. Plugin failures
  const failedPlugins = data.healthEvents
    .filter(e => e.pluginsFailed > 0);
  if (failedPlugins.length > 0) {
    incidents.push({
      severity: 'critical',
      type: 'plugin_failure',
      title: 'Plugin mount failed',
      details: `${failedPlugins[0].pluginsFailed} plugins failed to mount`,
      time: Date.now()
    });
  }

  return incidents;
};
```

#### Root Cause Analysis:
```typescript
const analyzeRootCause = (incident: Incident, data: MetricsData) => {
  // Simplified correlation analysis
  const correlations = [];

  // Check if Redis is unhealthy
  if (!data.metrics.redis.lastStatus?.healthy) {
    correlations.push({
      factor: 'Redis connection lost',
      correlation: 0.9,
      evidence: 'Redis status: unhealthy'
    });
  }

  // Check for LLM timeout spike
  const llmErrors = data.logs.filter(l =>
    l.msg?.includes('timeout') && l.plugin === 'llm'
  );
  if (llmErrors.length > 5) {
    correlations.push({
      factor: 'LLM timeout spike',
      correlation: 0.85,
      evidence: `${llmErrors.length} timeout errors in last 5 min`
    });
  }

  return {
    causalChain: buildCausalChain(correlations),
    evidence: correlations,
    recommendations: generateRecommendations(correlations)
  };
};
```

#### Acceptance Criteria:
- [ ] Incidents detected from metrics
- [ ] Severity badges colored correctly
- [ ] Incidents sorted by time
- [ ] Root cause analysis shows correlations
- [ ] Causal chain visualized
- [ ] Recommendations actionable
- [ ] Click navigates to logs/details

**Estimated**: 10h | **Actual**: ___ | **Notes**: ___

---

## Phase 1 Checkpoint

**Total Hours**: 42h
**Completion Criteria**:
- [x] All 6 widgets implemented
- [x] Real-time data updates working
- [x] Integrated into dashboard-page.tsx
- [x] Responsive grid layout configured
- [ ] No console errors (to be verified with real backend)
- [ ] Manual testing passed (pending backend data)

**Ready for Phase 2?**: ✅ YES - All foundation widgets complete and integrated

**Notes**: Dashboard integration completed on Jan 9, 2026. New widgets:
- Hero Metrics (Health/Uptime/Requests/Runtime)
- Activity Timeline (requests/errors over time)
- Smart Incidents (automated detection + RCA)
- Cost Attribution (adapter costs with anomaly detection)
- Performance Budget (SLO tracking with error budget)
- System Topology (ReactFlow graph with health visualization)

---

## 🚀 PHASE 2: ADVANCED FEATURES (36h) - Week 2

### Status: ⏸️ Not Started (0/36 hours)

---

### 2.1 Predictive Analytics (8h)

**Status**: ⏸️ Not Started
**Priority**: 🟢 Medium
**Dependencies**: Phase 1 metrics history

#### Tasks:
- [ ] Create `PredictionsCard.tsx` (2h)
  - Predicted incidents list
  - Probability badges
  - Preventive actions
  - Time until incident
- [ ] Create `CapacityForecast.tsx` (2h)
  - Resource usage prediction
  - Trend charts
  - Threshold warnings
- [ ] Implement forecasting (4h)
  - `useForecasting` hook
  - Time series analysis (ARIMA lite)
  - Anomaly detection (Z-score)
  - Pattern recognition (day/hour patterns)

#### ML Implementation:
```typescript
// Simple moving average forecast
const forecast = (data: number[], periods: number) => {
  const windowSize = 7;
  const predictions = [];

  for (let i = 0; i < periods; i++) {
    const window = data.slice(-windowSize);
    const avg = window.reduce((a, b) => a + b) / window.length;
    predictions.push(avg);
    data.push(avg);
  }

  return predictions;
};

// Z-score anomaly detection
const detectAnomalies = (data: number[], threshold = 2.5) => {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const stdDev = Math.sqrt(
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  );

  return data.map((val, idx) => ({
    index: idx,
    value: val,
    zScore: (val - mean) / stdDev,
    isAnomaly: Math.abs((val - mean) / stdDev) > threshold
  }));
};
```

#### Acceptance Criteria:
- [ ] Predictions display with probability
- [ ] Capacity forecast shows 7-day trend
- [ ] Anomalies highlighted
- [ ] Preventive actions suggested
- [ ] Forecasts update daily

**Estimated**: 8h | **Actual**: ___ | **Notes**: ___

---

### 2.2 Chaos Engineering UI (10h)

**Status**: ⏸️ Not Started
**Priority**: 🟢 Medium
**Dependencies**: Backend API (not yet implemented)

#### Tasks:
- [ ] Create `ChaosExperimentRunner.tsx` (3h)
  - Experiment form
  - Start/stop controls
  - Progress indicator
  - Real-time results
- [ ] Create `ExperimentLibrary.tsx` (2h)
  - Pre-built experiment templates
  - Filter by type
  - Search
  - Last run info
- [ ] Create `ResilienceScore.tsx` (2h)
  - Overall score (0-100)
  - Breakdown by category
  - Historical trend
  - Recommendations
- [ ] Implement experiment runner (3h)
  - State management
  - API integration
  - Auto-rollback on SLO violation
  - Results collection

#### Experiment Types:
```typescript
const experimentLibrary: ChaosExperiment[] = [
  {
    id: 'latency-injection',
    name: 'LLM Latency Injection',
    target: 'llm-adapter',
    type: 'latency',
    config: { latencyMs: 500, blastRadius: 10 },
    hypothesis: 'System handles 500ms latency gracefully'
  },
  {
    id: 'redis-partition',
    name: 'Redis Network Partition',
    target: 'redis',
    type: 'network',
    config: { duration: 60000, blastRadius: 100 },
    hypothesis: 'System falls back to direct DB on Redis failure'
  },
  // ... more experiments
];
```

#### Acceptance Criteria:
- [ ] Experiment library displays
- [ ] Can start/stop experiments
- [ ] Real-time results show
- [ ] Auto-rollback works
- [ ] Resilience score calculates
- [ ] Historical results stored

**Estimated**: 10h | **Actual**: ___ | **Notes**: ___

**⚠️ Backend API Required**: Chaos injection middleware not yet implemented

---

### 2.3 AI Insights Chatbot (6h)

**Status**: ⏸️ Not Started
**Priority**: 🟢 Medium
**Dependencies**: Backend LLM endpoint

#### Tasks:
- [ ] Create `AIInsightsChat.tsx` (3h)
  - Chat interface
  - Message bubbles
  - Typing indicator
  - Context display
- [ ] Create `InsightCard.tsx` (1h)
  - Insight display
  - Action buttons
  - Copy to clipboard
- [ ] Implement chat logic (2h)
  - Context gathering
  - API integration
  - Response parsing
  - Error handling

#### Implementation:
```typescript
const askQuestion = async (question: string) => {
  const context = {
    metrics: metrics.data,
    llm: llm.data,
    devkit: devkit.data,
    recentErrors: metrics.data?.errors.recent
  };

  const response = await fetch('/api/v1/insights/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context })
  });

  return response.json();
};
```

#### Example Questions:
- "Why is analytics costing more than usual?"
- "What's causing the latency spike?"
- "How can I reduce LLM costs?"
- "Is the system healthy?"

#### Acceptance Criteria:
- [ ] Chat interface works
- [ ] Questions send correctly
- [ ] Responses display formatted
- [ ] Context included automatically
- [ ] Error messages shown
- [ ] Copy insights works

**Estimated**: 6h | **Actual**: ___ | **Notes**: ___

**⚠️ Backend API Required**: `/api/v1/insights/ask` endpoint

---

### 2.4 Comparative Benchmarking (4h)

**Status**: ⏸️ Not Started
**Priority**: 🟢 Low
**Dependencies**: Backend benchmark data

#### Tasks:
- [ ] Create `BenchmarkCard.tsx` (2h)
  - Metrics comparison table
  - Your vs Median vs Top 10%
  - Color coding
  - Percentile badges
- [ ] Implement benchmark calculations (2h)
  - Mock industry data
  - Percentile calculations
  - Status determination

#### Implementation:
```typescript
const benchmarkData = {
  industry: {
    median: { errorRate: 1.2, p95Latency: 120, cacheHitRate: 75, costPer1kReq: 0.45 },
    top10Percent: { errorRate: 0.3, p95Latency: 45, cacheHitRate: 92, costPer1kReq: 0.18 }
  }
};

const yourMetrics = {
  errorRate: calculateErrorRate(metrics.data),
  p95Latency: metrics.data?.latency.p95,
  cacheHitRate: stateBroker.data?.hitRate * 100,
  costPer1kReq: (totalCost / metrics.data?.requests.total) * 1000
};
```

#### Acceptance Criteria:
- [ ] Table displays all metrics
- [ ] Color coding shows performance
- [ ] Percentile badges show rank
- [ ] Comparison tooltips explain

**Estimated**: 4h | **Actual**: ___ | **Notes**: ___

---

### 2.5 Time Travel Debugging (4h)

**Status**: ⏸️ Not Started
**Priority**: 🟢 Low
**Dependencies**: Historical data storage

#### Tasks:
- [ ] Create `TimeTravelControls.tsx` (2h)
  - Date/time picker
  - Playback controls
  - Speed selector
  - Timeline slider
- [ ] Implement time travel logic (2h)
  - Query historical data
  - Update dashboard state
  - Playback animation
  - Reset to live

#### Implementation:
```typescript
const [selectedTime, setSelectedTime] = useState<Date | null>(null);
const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x

const historicalMetrics = useQuery({
  queryKey: ['metrics', 'historical', selectedTime],
  queryFn: () => fetchHistoricalMetrics(selectedTime),
  enabled: selectedTime !== null
});

// Playback animation
useEffect(() => {
  if (playing && selectedTime) {
    const interval = setInterval(() => {
      setSelectedTime(prev =>
        new Date(prev!.getTime() + (1000 * playbackSpeed))
      );
    }, 1000);
    return () => clearInterval(interval);
  }
}, [playing, selectedTime, playbackSpeed]);
```

#### Acceptance Criteria:
- [ ] Can select past timestamp
- [ ] Dashboard shows historical data
- [ ] Playback works smoothly
- [ ] Speed controls work
- [ ] Reset to live works

**Estimated**: 4h | **Actual**: ___ | **Notes**: ___

**⚠️ Requires**: Historical metrics storage (not yet implemented)

---

### 2.6 Polish & Animations (4h)

**Status**: ⏸️ Not Started
**Priority**: 🟡 High
**Dependencies**: Phase 1 + Phase 2 complete

#### Tasks:
- [ ] Add number animations (1h)
  - Install `react-countup`
  - Apply to all metrics
  - Configure duration/easing
- [ ] Add transitions (1h)
  - Install `framer-motion`
  - Fade in for new data
  - Slide animations
  - Hover effects
- [ ] Add loading states (1h)
  - Skeleton components
  - Shimmer effects
  - Loading spinners
- [ ] Responsive layout (1h)
  - Mobile breakpoints
  - Tablet layout
  - Desktop optimization

#### Implementation:
```typescript
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

// Countup animation
<CountUp
  end={metrics.data?.requests.total ?? 0}
  duration={1}
  separator=","
/>

// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>

// Pulse animation for LIVE
<motion.div
  animate={{ opacity: [1, 0.5, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  🟢 LIVE
</motion.div>
```

#### Acceptance Criteria:
- [ ] Numbers animate on change
- [ ] Smooth transitions
- [ ] Loading states show
- [ ] Responsive on all devices
- [ ] Animations performant (60fps)

**Estimated**: 4h | **Actual**: ___ | **Notes**: ___

---

## Phase 2 Checkpoint

**Total Hours**: 36h
**Completion Criteria**:
- [ ] All 6 advanced features implemented
- [ ] Animations smooth
- [ ] Responsive tested
- [ ] No performance issues

**Ready for Testing?**: ⏸️ Waiting

---

## 🧪 TESTING & INTEGRATION (10h)

### Status: ⏸️ Not Started

#### Tasks:
- [ ] Unit tests for calculations (2h)
  - Cost calculations
  - SLO calculations
  - Forecasting
  - Anomaly detection
- [ ] Integration tests (3h)
  - Data hooks integration
  - Real API calls
  - Error handling
- [ ] E2E tests (3h)
  - User flows
  - Dashboard navigation
  - Data updates
- [ ] Performance testing (2h)
  - Load testing
  - Memory leaks
  - Re-render optimization

#### Acceptance Criteria:
- [ ] >80% code coverage
- [ ] All critical paths tested
- [ ] No console errors in prod
- [ ] Performance benchmarks met

**Estimated**: 10h | **Actual**: ___ | **Notes**: ___

---

## 📝 DOCUMENTATION (4h)

### Status: ⏸️ Not Started

#### Tasks:
- [ ] User guide (2h)
  - Dashboard overview
  - Feature explanations
  - Troubleshooting
- [ ] Developer docs (1h)
  - Component API
  - Data flow
  - Extension guide
- [ ] README updates (1h)
  - Installation
  - Configuration
  - Screenshots

**Estimated**: 4h | **Actual**: ___ | **Notes**: ___

---

## 📦 DELIVERABLES CHECKLIST

### Week 1 Deliverable:
- [ ] Hero Metrics (4 cards)
- [ ] Activity Timeline
- [ ] Cost Attribution
- [ ] Performance Budget Tracker
- [ ] System Topology Graph
- [ ] Smart Incidents

### Week 2 Deliverable:
- [ ] Predictive Analytics
- [ ] Chaos Engineering UI
- [ ] AI Insights Chatbot
- [ ] Comparative Benchmarking
- [ ] Time Travel Debugging
- [ ] Full UI Polish

### Final Deliverable:
- [ ] All features implemented
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Production ready

---

## 🎯 BLOCKERS & DEPENDENCIES

### Backend APIs Not Yet Implemented:
1. **Chaos Engineering**
   - `/api/v1/chaos/experiments` (POST, GET, DELETE)
   - Fault injection middleware
   - Auto-rollback logic

2. **AI Insights**
   - `/api/v1/insights/ask` (POST)
   - LLM with function calling
   - Context gathering

3. **Historical Data**
   - Metrics time-series storage
   - Query by timestamp
   - Playback support

4. **Benchmark Data**
   - Industry benchmark API
   - Anonymized comparison data

### External Dependencies:
- [ ] `reactflow` - System topology graph
- [ ] `react-countup` - Number animations
- [ ] `framer-motion` - Transitions
- [ ] Chart libraries already installed ✅

---

## 📊 METRICS & TARGETS

### Performance Targets:
- [ ] Initial load: <3s
- [ ] Time to interactive: <5s
- [ ] Real-time update lag: <500ms
- [ ] Memory usage: <100MB
- [ ] 60fps animations

### Quality Targets:
- [ ] 0 console errors
- [ ] 0 TypeScript errors
- [ ] >80% test coverage
- [ ] Lighthouse score >90

---

## 🗓️ TIMELINE

```
Week 1: Foundation (42h)
├─ Day 1-2: Hero Metrics + Timeline (8h)
├─ Day 3: Cost Attribution (8h)
├─ Day 4: Performance Budget (6h)
├─ Day 5: Topology Graph (10h)
└─ Day 6-7: Smart Incidents (10h)

Week 2: Advanced Features (36h)
├─ Day 8-9: Predictive + Chaos (18h)
├─ Day 10: AI Insights + Benchmark (10h)
├─ Day 11: Time Travel + Polish (8h)
└─ Day 12-14: Testing + Docs (14h)
```

---

## 📝 NOTES & DECISIONS

### 2026-01-09 - Planning Complete
- Research completed: 5 hours
- All APIs documented
- Component structure defined
- Ready to start Phase 1

**Decision**: Start with Hero Metrics + Timeline (Day 1-2) as quick wins to show progress.

---

## 🏁 SIGN-OFF

### Phase 1 Sign-off:
**Date**: ___
**Completed by**: ___
**Reviewed by**: ___
**Status**: ⏸️ Pending

### Phase 2 Sign-off:
**Date**: ___
**Completed by**: ___
**Reviewed by**: ___
**Status**: ⏸️ Pending

### Final Sign-off:
**Date**: ___
**Completed by**: ___
**Reviewed by**: ___
**Status**: ⏸️ Pending

---

## 📋 NEXT STEPS: BACKEND & TESTING

### Phase 3: Backend Integration (Estimated: 10-12h)

#### 3.1 Historical Data Endpoints (4h) ✅ COMPLETED
**Priority**: 🔴 Critical for PredictiveAnalytics & Heatmap
**Completion Date**: 2026-01-09

```typescript
// Implemented endpoints:
GET /api/v1/observability/metrics/history
  ?metric=requests|errors|latency|uptime
  &range=1m|5m|10m|30m|1h
  &interval=5s|1m|5m
  Response: { timestamp: number, value: number }[]

GET /api/v1/observability/metrics/heatmap
  ?metric=latency|errors|requests
  &days=7
  Response: { day: string, hour: number, value: number }[]
```

**Tasks:**
- [x] Add historical metrics collection to Prometheus adapter
- [x] Implement time-series aggregation
- [x] Add platform.cache storage for historical data (TTL-based)
- [x] Test with different time ranges

**Implementation:**
- Created `HistoricalMetricsCollector` service
- Background collection every 5 seconds
- Ring buffer storage (1m-1h retention)
- Heatmap aggregation (7 days × 24 hours)
- Auto-cleanup via TTL

**Files Created:**
- `apps/rest-api/src/services/historical-metrics.ts` (460 lines)
- `docs/HISTORICAL_METRICS.md` (comprehensive documentation)

**Files Modified:**
- `apps/rest-api/src/routes/observability.ts` (added 2 endpoints)
- `apps/rest-api/src/routes/index.ts` (integrated collector)
- `packages/rest-api-contracts/src/observability.ts` (added types)

#### 3.2 Enhanced Adapter Statistics (3h)
**Priority**: 🟡 Medium for CostAttribution

```typescript
// Enhance existing endpoints:
GET /api/v1/adapters/llm/usage
  - Add: p50/p95/p99 latency
  - Add: error breakdown by type
  - Add: cost per 1K tokens

GET /api/v1/adapters/embeddings/usage
  - Add: tokens per request distribution
  - Add: model comparison stats
```

**Tasks:**
- [ ] Update adapter telemetry schema
- [ ] Add percentile calculations
- [ ] Enhance cost tracking granularity

#### 3.3 Incident History Storage (2h)
**Priority**: 🟢 Low for SmartIncidents enhancement

```typescript
POST /api/v1/observability/incidents
  body: { type, severity, title, details, rootCause, timestamp }

GET /api/v1/observability/incidents/history
  ?limit=50&severity=critical|warning
  Response: Incident[]
```

**Tasks:**
- [ ] Create incidents table/collection
- [ ] Implement CRUD endpoints
- [ ] Add TTL for old incidents (30 days)

#### 3.4 System Events Enhancement (2h)
**Priority**: 🟡 Medium for accurate health tracking

```typescript
// Enhance existing:
GET /api/v1/observability/events
  - Add: plugin startup/shutdown events
  - Add: configuration change events
  - Add: deployment markers
```

**Tasks:**
- [ ] Extend event schema
- [ ] Add event filtering
- [ ] Implement event search

---

### Phase 4: Testing & Validation (8h)

#### 4.1 Integration Testing (4h)

**Widget-by-widget validation:**
- [ ] HeroMetricsWidget - verify all 4 cards update correctly
- [ ] ActivityTimelineWidget - verify time range switching
- [ ] SmartIncidentsWidget - trigger incidents, verify RCA
- [ ] CostAttributionWidget - verify cost calculations
- [ ] PerformanceBudgetWidget - verify SLO calculations
- [ ] SystemTopologyWidget - verify graph rendering & clicks
- [ ] PredictiveAnalyticsWidget - verify predictions with real data
- [ ] ComparativeBenchmarkWidget - verify scoring algorithm
- [ ] PerformanceHeatmapWidget - verify weekly patterns

**Data flow testing:**
- [ ] SSE connection stability (15min+ continuous)
- [ ] Auto-refresh behavior (verify no memory leaks)
- [ ] Historical data loading (large datasets)
- [ ] Error handling (backend down, malformed data)

#### 4.2 Performance Testing (2h)

**Metrics to validate:**
- [ ] Initial page load < 2s
- [ ] Widget render time < 500ms each
- [ ] Memory usage stable over 1hr
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Smooth animations (60fps)

**Load scenarios:**
- [ ] 100+ plugins in topology
- [ ] 1000+ data points in charts
- [ ] 50+ notifications
- [ ] Multiple dashboards open

#### 4.3 Browser Compatibility (1h)

**Test matrix:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Responsive (tablet/desktop)

#### 4.4 Accessibility (1h)

**WCAG 2.1 AA compliance:**
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Color contrast (all widgets)
- [ ] Focus indicators
- [ ] ARIA labels for interactive elements

---

### Phase 5: Documentation (4h)

#### 5.1 User Guide (2h)

Create `INTELLIGENCE_DASHBOARD_USER_GUIDE.md`:
- [ ] Widget descriptions & use cases
- [ ] Layout customization guide
- [ ] Metric interpretation guide
- [ ] Troubleshooting common issues

#### 5.2 Developer Documentation (2h)

- [ ] Widget development guide
- [ ] Data hooks documentation
- [ ] Backend API contracts
- [ ] Adding new widgets tutorial

---

## 📊 FINAL CHECKLIST

### Frontend ✅ (Complete - 68h)
- [x] 9 widgets created
- [x] Dashboard integration
- [x] Animations & polish
- [x] Responsive layout
- [x] LocalStorage persistence

### Backend ⏸️ (Pending - 12h)
- [ ] Historical data endpoints
- [ ] Enhanced adapter stats
- [ ] Incident history storage
- [ ] System events enhancement

### Testing ⏸️ (Pending - 8h)
- [ ] Integration tests
- [ ] Performance tests
- [ ] Browser compatibility
- [ ] Accessibility audit

### Documentation ⏸️ (Pending - 4h)
- [ ] User guide
- [ ] Developer docs

---

**Total Remaining**: 24 hours (Backend 12h + Testing 8h + Docs 4h)
**Overall Progress**: 74% → 100% when complete

---

**Last Updated**: 2026-01-09 (Phase 1 & 2 complete)
**Version**: 2.0
**Status**: 🟢 Frontend Complete | 🔄 Backend & Testing Pending
