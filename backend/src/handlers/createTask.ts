import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";

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

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  };
};

const errorResponse = (
  statusCode: number,
  message: string,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});
