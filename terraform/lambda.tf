# ビルド済みのlistTasks.jsをzip化
data "archive_file" "list_tasks_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/dist/handlers/listTasks.js"
  output_path = "${path.module}/build/listTasks.zip"
}

# Lambdaが「誰として動くか」の身分(IAMロール)
# assume_role_policyは「このロールをLambdaサービスが引き受けてよい」という許可
resource "aws_iam_role" "list_tasks_role" {
  name = "list-tasks-tf-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# ログ出力の権限(CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "list_tasks_logs" {
  role       = aws_iam_role.list_tasks_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda用の、DynamoDB読み取り権限
resource "aws_iam_role_policy" "list_tasks_dynamodb" {
  name = "list-tasks-tf-dynamodb-read"
  role = aws_iam_role.list_tasks_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Scan",
          "dynamodb:GetItem"
        ]
        # tasks_learningテーブルのARNを指定して、読み取り権限を付与
        Resource = aws_dynamodb_table.tasks_learning.arn
      }
    ]
  })
}

# Lambda関数本体
resource "aws_lambda_function" "list_tasks" {
  function_name = "list-tasks-tf"
  role          = aws_iam_role.list_tasks_role.arn
  handler       = "listTasks.handler"
  runtime       = "nodejs20.x"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.list_tasks_zip.output_path
  source_code_hash = data.archive_file.list_tasks_zip.output_base64sha256

  # 操作対象のテーブル名を環境変数で渡す(SAMと同じ考え方)
  environment {
    variables = {
      TASKS_TABLE = aws_dynamodb_table.tasks_learning.name
    }
  }
}
