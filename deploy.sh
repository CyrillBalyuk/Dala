#!/bin/bash

# Скрипт автоматического развертывания для codedala.kz
# Этот скрипт должен быть размещен на сервере и запускаться при получении новых коммитов

set -e

echo "🚀 Начинаю развертывание..."

# Переходим в директорию проекта
cd /home/codedala_kz/git/Dala.git

# Обновляем код из репозитория
echo "📥 Обновляю код из репозитория..."
git fetch origin main
git reset --hard origin/main

# Устанавливаем зависимости
echo "📦 Устанавливаю зависимости..."
npm ci --production=false

# Собираем проект
echo "🔨 Собираю проект..."
npm run build

# Копируем собранные файлы в web-директорию
echo "📁 Копирую файлы в web-директорию..."
rm -rf /home/codedala_kz/httpdocs/*
cp -r dist/* /home/codedala_kz/httpdocs/

echo "✅ Развертывание завершено успешно!"