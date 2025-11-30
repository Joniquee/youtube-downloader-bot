import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { downloads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegramId, username, firstName, lastName } = body

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId обязателен' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID обязателен' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Пользователь удален' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    )
  }
}