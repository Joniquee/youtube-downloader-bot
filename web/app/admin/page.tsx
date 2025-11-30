import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Download, CheckCircle, XCircle } from 'lucide-react'

async function getStats() {
  const totalUsers = await prisma.user.count()
  const totalDownloads = await prisma.download.count()
  const completedDownloads = await prisma.download.count({
    where: { status: 'completed' },
  })
  const failedDownloads = await prisma.download.count({
    where: { status: 'failed' },
  })

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { downloads: true },
      },
    },
  })

  const topUsers = await prisma.user.findMany({
    take: 5,
    include: {
      _count: {
        select: { downloads: true },
      },
    },
    orderBy: {
      downloads: {
        _count: 'desc',
      },
    },
  })

  return {
    totalUsers,
    totalDownloads,
    completedDownloads,
    failedDownloads,
    recentUsers,
    topUsers,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Дашборд</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего загрузок</CardTitle>
            <Download className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Успешных</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedDownloads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Неудачных</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedDownloads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent and Top Users */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Недавние пользователи</CardTitle>
            <CardDescription>Последние 5 зарегистрированных пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {user.firstName || user.username || 'Неизвестно'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Telegram ID: {user.telegramId}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {user._count.downloads} загрузок
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ пользователей</CardTitle>
            <CardDescription>Пользователи с наибольшим количеством загрузок</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">
                        {user.firstName || user.username || 'Неизвестно'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Telegram ID: {user.telegramId}
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {user._count.downloads}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}