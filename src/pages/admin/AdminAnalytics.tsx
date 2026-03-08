import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Users, Monitor, Smartphone, Tablet, TrendingUp, Clock, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface AnalyticsSummary {
  total_views: number;
  unique_sessions: number;
  today_views: number;
  yesterday_views: number;
  top_pages: { page_path: string; views: number }[] | null;
  daily_views: { date: string; views: number; unique_visitors: number }[] | null;
  device_breakdown: { device_type: string; views: number }[] | null;
  browser_breakdown: { browser: string; views: number }[] | null;
  hourly_distribution: { hour: number; views: number }[] | null;
}

const COLORS = ['hsl(45, 93%, 47%)', 'hsl(220, 60%, 25%)', 'hsl(45, 80%, 60%)', 'hsl(220, 40%, 45%)', 'hsl(45, 70%, 70%)'];

const pageNameMap: Record<string, string> = {
  '/': 'Startseite',
  '/impressum': 'Impressum',
  '/datenschutz': 'Datenschutz',
};

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const deviceLabels: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobil',
  tablet: 'Tablet',
};

export default function AdminAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        days_back: parseInt(period),
      });

      if (error) throw error;
      setSummary(data as unknown as AnalyticsSummary);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const todayChange = summary
    ? summary.yesterday_views > 0
      ? Math.round(((summary.today_views - summary.yesterday_views) / summary.yesterday_views) * 100)
      : summary.today_views > 0
        ? 100
        : 0
    : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Analyse</h1>
            <p className="text-muted-foreground mt-1">Besucherstatistiken und Seitenaufrufe</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Seitenaufrufe</CardTitle>
              <Eye className="w-5 h-5 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.total_views || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Letzte {period} Tage</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Besucher</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.unique_sessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Eindeutige Sessions</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Heute</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.today_views || 0}</div>
              <p className={`text-xs mt-1 ${todayChange >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                {todayChange >= 0 ? '+' : ''}{todayChange}% vs. gestern
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ø pro Tag</CardTitle>
              <Globe className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary?.daily_views?.length
                  ? Math.round(summary.total_views / summary.daily_views.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Durchschnitt</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Views Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Tägliche Aufrufe</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.daily_views && summary.daily_views.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={summary.daily_views}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 60%, 25%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220, 60%, 25%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getDate()}.${d.getMonth() + 1}.`;
                    }}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    labelFormatter={(value) => {
                      const d = new Date(value);
                      return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'views' ? 'Aufrufe' : 'Besucher',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(45, 93%, 47%)"
                    fill="url(#colorViews)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="unique_visitors"
                    stroke="hsl(220, 60%, 25%)"
                    fill="url(#colorUnique)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Noch keine Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Beliebteste Seiten</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.top_pages && summary.top_pages.length > 0 ? (
                <div className="space-y-3">
                  {summary.top_pages.map((page, i) => {
                    const maxViews = summary.top_pages![0].views;
                    const percentage = Math.round((page.views / maxViews) * 100);
                    return (
                      <div key={page.page_path} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate">
                            {pageNameMap[page.page_path] || page.page_path}
                          </span>
                          <span className="text-muted-foreground ml-2">{page.views}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gold rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Keine Daten</p>
              )}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Geräte</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.device_breakdown && summary.device_breakdown.length > 0 ? (
                <div className="flex items-center gap-8">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.device_breakdown}
                          dataKey="views"
                          nameKey="device_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                        >
                          {summary.device_breakdown.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))',
                          }}
                          formatter={(value: number, name: string) => [
                            value,
                            deviceLabels[name] || name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {summary.device_breakdown.map((device, i) => {
                      const total = summary.device_breakdown!.reduce((sum, d) => sum + d.views, 0);
                      const percentage = total > 0 ? Math.round((device.views / total) * 100) : 0;
                      const Icon = deviceIcons[device.device_type] || Monitor;
                      return (
                        <div key={device.device_type} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm flex-1">
                            {deviceLabels[device.device_type] || device.device_type}
                          </span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Keine Daten</p>
              )}
            </CardContent>
          </Card>

          {/* Browser Breakdown */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif">Browser</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.browser_breakdown && summary.browser_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.browser_breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="browser"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number) => [value, 'Aufrufe']}
                    />
                    <Bar dataKey="views" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Keine Daten</p>
              )}
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Tageszeit-Verteilung
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.hourly_distribution && summary.hourly_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.hourly_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="hour"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(h) => `${h}:00`}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      labelFormatter={(h) => `${h}:00 – ${h}:59 Uhr`}
                      formatter={(value: number) => [value, 'Aufrufe']}
                    />
                    <Bar dataKey="views" fill="hsl(220, 60%, 25%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Keine Daten</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
