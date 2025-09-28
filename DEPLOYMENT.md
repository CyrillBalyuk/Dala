# Инструкции по развертыванию сайта codedala.kz

## Варианты развертывания

### 1. Автоматическое развертывание через GitHub Actions (Рекомендуется)

GitHub Actions автоматически собирает и загружает сайт при каждом push в ветку `main`.

#### Настройка:

1. В настройках GitHub репозитория перейдите в `Settings` → `Secrets and variables` → `Actions`
2. Добавьте секрет `FTP_PASSWORD` со значением: `AINC2_y#1uir`
3. Файл `.github/workflows/deploy.yml` уже настроен и готов к работе

#### Использование:
```bash
git add .
git commit -m "Обновление сайта"
git push origin main
```

Сайт автоматически обновится через 2-3 минуты.

### 2. Ручное развертывание через скрипт на сервере

#### Настройка на сервере:

1. Подключитесь к серверу по SSH
2. Скопируйте файл `deploy.sh` в `/home/codedala_kz/`
3. Сделайте его исполняемым:
   ```bash
   chmod +x /home/codedala_kz/deploy.sh
   ```

#### Использование:
```bash
# На сервере
/home/codedala_kz/deploy.sh
```

### 3. Ручная загрузка через FTP

Используйте этот метод только в крайнем случае:

```bash
# Сборка проекта
npm run build

# Загрузка файлов
curl -T "dist/index.html" ftp://codedala.kz/httpdocs/ --user codedala_kz:AINC2_y#1uir
# И так далее для всех файлов...
```

## Структура проекта на сервере

```
/home/codedala_kz/
├── git/Dala.git/          # Git репозиторий
├── httpdocs/              # Веб-директория (сюда попадают собранные файлы)
├── deploy.sh              # Скрипт развертывания
└── logs/                  # Логи
```

## Устранение неполадок

### Сайт не обновляется
1. Проверьте, что файлы загружены в папку `httpdocs`, а не в корень FTP
2. Убедитесь, что сборка прошла успешно (`npm run build`)
3. Проверьте логи GitHub Actions

### Ошибки TypeScript
Запустите локально:
```bash
npm run build
```
Исправьте все ошибки перед push.

### Проблемы с GitHub Actions
1. Проверьте, что секрет `FTP_PASSWORD` добавлен правильно
2. Убедитесь, что файл `.github/workflows/deploy.yml` находится в репозитории

## Контакты хостинга

- **Хост:** codedala.kz
- **Логин:** codedala_kz
- **FTP:** ftp://codedala.kz/
- **Веб-директория:** `/httpdocs/`