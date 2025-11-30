import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { downloads: true },
      },
      downloads: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return users
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Управление пользователями</h1>

      <Card>
        <CardHeader>
          <CardTitle>Все пользователи ({users.length})</CardTitle>
          <CardDescription>
            Полный список зарегистрированных пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Имя</th>
                  <th className="text-left py-3 px-4">Username</th>
                  <th className="text-left py-3 px-4">Telegram ID</th>
                  <th className="text-left py-3 px-4">Загрузок</th>
                  <th className="text-left py-3 px-4">Регистрация</th>
                  <th className="text-left py-3 px-4">Последняя активность</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {user.username ? `@${user.username}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{user.telegramId}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {user._count.downloads}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.downloads[0]
                        ? formatDate(user.downloads[0].createdAt)
                        : 'Нет активности'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}