# Node.js のバージョンを指定
FROM node:20.11.0

# Playwright が必要とする依存関係をインストール
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && apt-get install -y libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Playwright をインストールしてブラウザをセットアップ
RUN npx playwright install