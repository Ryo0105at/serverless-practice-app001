# どのクラウドを使うか、そのバージョンを指定する
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWSプロバイダの設定
provider "aws" {
  region = "ap-northeast-1"
}

# 学習用のDynamoDBテーブル。SAMのtasksとは別名にして競合を避ける
# aws_dynamodb_table という種類のリソースを、tasks_learning という名前（Terraform内での呼び名）で作る
resource "aws_dynamodb_table" "tasks_learning" {
  # DynamoDBテーブルの名前
  name         = "tasks-tf-learning"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
