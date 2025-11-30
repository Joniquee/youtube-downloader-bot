import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatFileSize } from '@/lib/utils'
import { Download, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getRecentDownloads() {
  const downloads = await prisma.download.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  })
  return downloads
}

async function getStats() {
  const totalUsers = await prisma.user.count()
  const totalDownloads = await prisma.download.count()
  const completedDownloads = await prisma.download.count({
    where: { status: 'completed' },
  })
  
  return {
    totalUsers,
    totalDownloads,
    completedDownloads,
  }
}

export default async function ProfilePage() {
  const downloads = await getRecentDownloads()
  const stats = await getStats()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'Завершено',
      failed: 'Ошибка',
      processing: 'В процессе',
      pending: 'Ожидание',
    }
    return statusMap[status] || status
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">История загрузок</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">{stats.totalUsers}</CardTitle>
              <CardDescription>Всего пользователей</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">{stats.totalDownloads}</CardTitle>
              <CardDescription>Всего загрузок</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">{stats.completedDownloads}</CardTitle>
              <CardDescription>Успешных загрузок</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Downloads */}
        <Card>
          <CardHeader>
            <CardTitle>Последние загрузки</CardTitle>
            <CardDescription>
              Последние {downloads.length} загрузок в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            {downloads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Пока нет загрузок
              </p>
            ) : (
              <div className="space-y-4">
                {downloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(download.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {download.videoTitle || 'Без названия'}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <p>
                          Пользователь: {download.user.firstName || download.user.username || 'Неизвестно'}
                        </p>
                        <p>
                          Формат: {download.format} • Качество: {download.quality}
                        </p>
                        {download.fileSize && (
                          <p>Размер: {formatFileSize(download.fileSize)}</p>
                        )}
                        <p>Создано: {formatDate(download.createdAt)}</p>
                        {download.completedAt && (
                          <p>Завершено: {formatDate(download.completedAt)}</p>
                        )}
                        {download.errorMessage && (
                          <p className="text-red-600">Ошибка: {download.errorMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          download.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : download.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : download.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatusText(download.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}