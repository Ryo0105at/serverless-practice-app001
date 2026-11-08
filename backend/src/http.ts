import type { APIGatewayProxyResultV2 } from "aws-lambda";

export const JSON_HEADERS = { "Content-Type": "application/json" };

export const successResponse = (
  statusCode: number,
  data: unknown,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(data),
});

export const errorResponse = (
  statusCode: number,
  message: string,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify({ message }),
});

export const isConditionalCheckFailed = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "ConditionalCheckFailedException";
