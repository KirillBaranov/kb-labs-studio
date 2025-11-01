import { DashboardKpis } from '../components/dashboard-kpis';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">KB Labs ecosystem overview</p>
      </div>
      <DashboardKpis />
    </div>
  );
}

