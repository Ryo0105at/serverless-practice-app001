# API本体 ← 統合（Lambdaを指す）← ルート（GET /tasksを統合へ）
#    ↑                                    
# ステージ（公開）                         
#    ↑                                    
# Lambda許可（API GatewayがLambdaを呼べる）

# HTTP API本体
resource "aws_apigatewayv2_api" "tasks_api" {
  name          = "tasks-api-tf"
  protocol_type = "HTTP"

  # フロントから叩けるようCORSを許可
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
    allow_headers = ["Content-Type"]
  }
}

# 統合：API GatewayとLambdaをつなぐ統合設定
resource "aws_apigatewayv2_integration" "list_tasks" {
  api_id                 = aws_apigatewayv2_api.tasks_api.id
  integration_type       = "AWS_PROXY"
  # LambdaのARNを指定して、API GatewayがこのLambdaを呼び出せるようにする
  integration_uri        = aws_lambda_function.list_tasks.invoke_arn
  payload_format_version = "2.0"
}

# ルート：GET /tasks が来たら上の統合へ
resource "aws_apigatewayv2_route" "list_tasks" {
  api_id    = aws_apigatewayv2_api.tasks_api.id
  route_key = "GET /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.list_tasks.id}"
}

# ステージ：APIを公開する単位。$defaultは自動デプロイされる既定ステージ
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.tasks_api.id
  name        = "$default"
  auto_deploy = true
}

# API GatewayがこのLambdaを呼び出す許可
resource "aws_lambda_permission" "list_tasks_api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_tasks.function_name
  # API Gatewayのサービスが呼び出すことを許可する
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.tasks_api.execution_arn}/*/*"
}

# デプロイ後にAPIのURLを表示する
output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}