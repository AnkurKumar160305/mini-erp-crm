import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  Archive, 
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  FileEdit
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    }
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const res = await api.get('/dashboard/charts');
      return res.data.data;
    }
  });

  if (statsLoading || chartsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Customers', value: statsData.totalCustomers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Active Customers', value: statsData.activeCustomers, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Products', value: statsData.totalProducts, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Total Stock', value: statsData.totalStock, icon: Archive, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Low Stock', value: statsData.lowStockProducts, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Out of Stock', value: statsData.outOfStockProducts, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Draft Challans', value: statsData.draftChallans, icon: FileEdit, color: 'text-slate-500', bg: 'bg-slate-100' },
    { title: 'Confirmed Challans', value: statsData.confirmedChallans, icon: FileText, color: 'text-success-500', bg: 'bg-success-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your business metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                </div>
                <div className={`rounded-full p-3 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Challan Trend</CardTitle>
            <CardDescription>Value of challans over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.challanTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="createdAt" 
                    tickFormatter={(val: any) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis style={{ fontSize: '12px' }} />
                  <RechartsTooltip 
                    labelFormatter={(val: any) => new Date(val).toLocaleDateString()}
                    formatter={(val: any) => [`₹${val}`, 'Amount']}
                  />
                  <Line type="monotone" dataKey="totalAmount" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Customer Distribution</CardTitle>
            <CardDescription>By customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.customerDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartsData.customerDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-sm mt-4">
                {chartsData.customerDistribution.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartsData.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartsData.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className={`mt-0.5 rounded-full p-2 ${activity.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activity.type === 'IN' ? <Archive className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.type === 'IN' ? 'Stock Added' : 'Stock Removed'} - {activity.product}
                    </p>
                    <p className="text-sm text-slate-500">
                      {activity.quantity} units {activity.reason ? `• ${activity.reason}` : ''}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(activity.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
