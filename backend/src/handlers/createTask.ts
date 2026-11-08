import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";
import { successResponse, errorResponse } from "../http";

interface CreateTaskBody {
  title?: unknown;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  //入力のバリデーション
  if (!event.body) {
    return errorResponse(400, "Request body is required");
  }

  let parsed: CreateTaskBody;
  try {
    // JSON.parse()を使用して、リクエストボディをオブジェクトに変換
    parsed = JSON.parse(event.body);
  } catch {
    return errorResponse(400, "Request body must be valid JSON");
  }

  // null・数値・配列なども有効なJSONなので、オブジェクトであることを確認
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return errorResponse(400, "Request body must be a JSON object");
  }

  // タイトルのバリデーション（文字列かつ空でない）
  if (typeof parsed.title !== "string" || parsed.title.trim() === "") {
    return errorResponse(
      400,
      "title is required and must be a non-empty string",
    );
  }

  // タスクの作成
  const task = {
    id: randomUUID(),
    title: parsed.title.trim(),
    completed: false,
  };

  // DynamoDBにタスクを保存
  await documentClient.send(
    new PutCommand({ TableName: TASKS_TABLE, Item: task }),
  );

  return successResponse(201, task);
};
