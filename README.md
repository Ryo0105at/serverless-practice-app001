## 構成

| 領域           | 使用技術                       |
| -------------- | ------------------------------ |
| フロントエンド | React / Vite / TypeScript      |
| バックエンド   | AWS Lambda（TypeScript）       |
| API            | Amazon API Gateway（HTTP API） |
| データベース   | Amazon DynamoDB                |
| 配信           | Amazon S3 + CloudFront         |
| IaC            | AWS SAM / Terraform            |

## アーキテクチャ

```
ブラウザ
  │
  ├─ CloudFront ─ S3（React SPA）
  │
  └─ API Gateway ─ Lambda ─ DynamoDB（タスク CRUD）
```

## ディレクトリ構成

```
.
├── .devcontainer/      Dev Container（Node / AWS CLI / SAM / Terraform）
├── docker-compose.yml  開発コンテナ + DynamoDB Local
├── backend/            バックエンド（Lambda + SAM）
│   ├── src/
│   │   ├── dynamodb.ts        DynamoDB 接続の共通設定
│   │   └── handlers/          CRUD の Lambda ハンドラ（5 本）
│   └── template.yaml          SAM テンプレート（DynamoDB / Lambda / API Gateway）
├── frontend/           フロントエンド（React SPA）
│   ├── src/
│   │   ├── api.ts             API 通信
│   │   └── App.tsx            画面
│   └── template.yaml          SAM テンプレート（S3 / CloudFront）
└── terraform/          Terraform による IaC（一部）
```

## リンク

https://d3njf2r6ukir9g.cloudfront.net
