## 構成

- フロント: React (Vite + TypeScript)
- バック: AWS Lambda (TypeScript) + API Gateway (HTTP API)（＊ローカルでは、sam local）
- DB: DynamoDB（ローカルは DynamoDB Local）
- 認証: Amazon Cognito
- IaC: Terraform（インフラ土台）+ AWS SAM（関数デプロイ）
- CI/CD: GitHub Actions

## 起動手順

1. VS Code でこのフォルダを開く
2. コマンドパレットから `Dev Containers: Reopen in Container` を実行
3. 初回はイメージのビルドが走る（数分かかる）

コンテナ内には Node 20 / AWS CLI / SAM CLI / Terraform が入っている。

## リンク

https://d3njf2r6ukir9g.cloudfront.net
