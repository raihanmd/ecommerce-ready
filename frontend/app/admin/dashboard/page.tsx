"use client";

import { useAnalytics } from "@/lib/queries/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  ShoppingCart,
  FolderTree,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { isAuthError, getErrorMessage } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, error, refetch } = useAnalytics();
  const { logout } = useAuthStore();
  const router = useRouter();

  // Handle authentication error
  if (error && isAuthError(error)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Your session has expired. Please login again.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Go to Login
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle other errors
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{getErrorMessage(error)}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Orders",
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `Rp ${(analytics?.totalRevenue || 0).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      trend: "+18.3%",
      trendUp: true,
    },
    {
      title: "Total Products",
      value: analytics?.totalProducts || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "Categories",
      value: analytics?.totalCategories || 0,
      icon: FolderTree,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pending Orders",
      value: analytics?.pendingOrders || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Approved Orders",
      value: analytics?.approvedOrders || 0,
      icon: CheckCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
    },
  ];

  const pendingPercentage = analytics?.totalOrders
    ? (analytics.pendingOrders / analytics.totalOrders) * 100
    : 0;

  const approvedPercentage = analytics?.totalOrders
    ? (analytics.approvedOrders / analytics.totalOrders) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.trend && (
                    <div
                      className={`flex items-center text-xs font-medium ${
                        stat.trendUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Status & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {analytics?.pendingOrders || 0}
                </span>
              </div>
              <Progress value={pendingPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {pendingPercentage.toFixed(1)}% of total orders
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {analytics?.approvedOrders || 0}
                </span>
              </div>
              <Progress value={approvedPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {approvedPercentage.toFixed(1)}% of total orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/dashboard/orders"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Orders</p>
                  <p className="text-xs text-muted-foreground">
                    View and process orders
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href="/admin/dashboard/products"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Products</p>
                  <p className="text-xs text-muted-foreground">
                    Add or edit products
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href="/admin/dashboard/categories"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <FolderTree className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Manage Categories</p>
                  <p className="text-xs text-muted-foreground">
                    Organize products
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Product stock updated</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <FolderTree className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New category created</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
