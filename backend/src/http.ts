// HTTPレスポンスを返すためのユーティリティ関数を定義するモジュール

import type { APIGatewayProxyResultV2 } from "aws-lambda";

export const JSON_HEADERS = { "Content-Type": "application/json" };

// 成功レスポンスを返す関数
export const successResponse = (
  statusCode: number,
  data: unknown,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(data),
});

// エラーレスポンスを返す関数
export const errorResponse = (
  statusCode: number,
  message: string,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify({ message }),
});

// DynamoDBのConditionalCheckFailedExceptionエラーかどうかを判定する関数
export const isConditionalCheckFailed = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "ConditionalCheckFailedException";
