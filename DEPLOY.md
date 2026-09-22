# デプロイ手順(Vercel + Render + Neon)

インターネット経由でどこからでも(Chrome/Safari/スマホ含む)アクセスできるようにするための、
無料枠中心の構成です。

- **フロントエンド**: [Vercel](https://vercel.com/) — Viteの静的ビルドをホスティング
- **バックエンド**: [Render](https://render.com/) — Dockerfileから`backend/`をWeb Serviceとしてデプロイ
- **DB**: [Neon](https://neon.tech/) — サーバーレスPostgreSQL(無料枠に期限切れなし)

## 1. Neon(DB)を用意する

1. Neonでアカウント作成 → プロジェクト作成
2. 接続情報(ホスト・DB名・ユーザー名・パスワード)を控える
3. JDBC形式のURLを組み立てる:
   `jdbc:postgresql://<host>/<db>?sslmode=require`

## 2. Render(バックエンド)にデプロイする

1. Renderでアカウント作成し、GitHubリポジトリを連携
2. 「New Web Service」→ このリポジトリを選択 → Root Directoryを`backend`に設定
3. 環境(Environment)は「Docker」を選択(`backend/Dockerfile`を自動検出)
4. 環境変数を設定:
   - `DATABASE_URL` = 手順1で組み立てたJDBC URL
   - `DATABASE_USERNAME` = Neonのユーザー名
   - `DATABASE_PASSWORD` = Neonのパスワード
   - `JWT_SECRET` = ランダムな32文字以上の文字列(必ず変更すること)
   - `CORS_ALLOWED_ORIGINS` = 手順3で発行されるVercelのURL(例: `https://xxx.vercel.app`)。フロントのURLが確定してから設定する
5. デプロイ後に発行されるURL(例: `https://xxx.onrender.com`)を控える

## 3. Vercel(フロントエンド)にデプロイする

1. Vercelでアカウント作成し、GitHubリポジトリを連携
2. Root Directoryを`trello-app`に設定(Framework Presetは自動でViteが検出される)
3. 環境変数を設定:
   - `VITE_API_BASE_URL` = `https://xxx.onrender.com/api`(手順2で控えたURL + `/api`)
4. デプロイ

## 4. CORSのURLを反映する

Vercelのデプロイが完了してURLが確定したら、Renderの環境変数`CORS_ALLOWED_ORIGINS`に
そのURLを設定し(未設定だった場合)、Renderのサービスを再デプロイする。

## 補足

- Renderの無料プランはアクセスが無いと一定時間でスリープし、次回アクセス時に起動まで
  数十秒かかることがある
- `spring.jpa.hibernate.ddl-auto=update`のままなので、テーブルはアプリ起動時に自動作成される
