import Link from 'next/link'
import { Users, Download, Home, BarChart } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Админ-панель
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Дашборд
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Пользователи
                </Link>
                <Link
                  href="/admin/downloads"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Загрузки
                </Link>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}