# Math Quest

A LeetCode-style math game for elementary school students (ages ~10). Built with Laravel 12, Inertia, React, and Tailwind CSS.

## Stack

- **Laravel 12** – Backend framework
- **Inertia.js** – SPA bridge
- **React** – Frontend
- **Tailwind CSS v4** – Styling
- **Pest** – Testing
- **Laravel Boost** – AI development tooling
- **Laravel AI SDK** – AI/LLM integration

## Requirements

- PHP 8.2+
- Composer
- Node.js & npm
- SQLite (default) or MySQL/PostgreSQL

## Setup

### PHP Note

This project requires PHP 8.2+. If you have multiple PHP versions (e.g. via Homebrew), ensure you use PHP 8.2+:

```bash
# Use PHP 8.5 from Homebrew (if installed)
export PATH="/opt/homebrew/Cellar/php/8.5.2/bin:$PATH"
```

### Installation

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file (if needed)
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Build frontend assets
npm run build
```

### Development

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Start Vite dev server
npm run dev
```

Visit [http://localhost:8000](http://localhost:8000)

### Testing

```bash
./vendor/bin/pest
```

## Laravel AI SDK

Add your AI provider API keys to `.env` for AI features:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
# See config/ai.php for more providers
```

## Next Steps

- Design math problem types (addition, subtraction, multiplication, division, word problems)
- Build problem generation logic
- Create the game UI (problem display, answer input, scoring)
- Add progress tracking and achievements for your 10-year-old!
