import Link from 'next/link'
import { Youtube, Download, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Youtube className="w-20 h-20 text-red-600" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            YouTube Downloader Bot
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Скачивайте видео и аудио с YouTube в высоком качестве прямо через Telegram
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="https://t.me/your_bot_username" target="_blank" rel="noopener noreferrer">
                Открыть бота
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/profile">Мой профиль</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Download className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Быстрая загрузка</CardTitle>
              <CardDescription>
                Скачивайте видео и аудио в считанные секунды
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Youtube className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>Выбор качества</CardTitle>
              <CardDescription>
                Выбирайте из всех доступных форматов и качеств
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Безопасно</CardTitle>
              <CardDescription>
                Все загрузки защищены и конфиденциальны
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How to use */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Как использовать</CardTitle>
            <CardDescription>Всего 4 простых шага</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  1
                </span>
                <div>
                  <h3 className="font-semibold">Откройте бота</h3>
                  <p className="text-gray-600">Найдите нашего бота в Telegram</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  2
                </span>
                <div>
                  <h3 className="font-semibold">Отправьте ссылку</h3>
                  <p className="text-gray-600">Вставьте ссылку на YouTube видео</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  3
                </span>
                <div>
                  <h3 className="font-semibold">Выберите формат</h3>
                  <p className="text-gray-600">Видео или аудио, выберите качество</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  4
                </span>
                <div>
                  <h3 className="font-semibold">Получите файл</h3>
                  <p className="text-gray-600">Скачивание займет всего несколько секунд</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p>© 2024 YouTube Downloader Bot. Все права защищены.</p>
          <div className="mt-4 space-x-4">
            <Link href="/admin" className="hover:text-blue-600">
              Админ-панель
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}