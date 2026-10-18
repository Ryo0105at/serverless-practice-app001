import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";

interface UpdateTaskBody {
  title?: unknown;
  completed?: unknown;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  // パスパラメータからタスクIDを取得
  const id = event.pathParameters?.id;
  if (!id) {
    return errorResponse(400, "id is required");
  }

  if (!event.body) {
    return errorResponse(400, "Request body is required");
  }

  // JSON.parse()を使用して、リクエストボディをオブジェクトに変換
  let parsed: UpdateTaskBody;
  try {
    parsed = JSON.parse(event.body);
  } catch {
    return errorResponse(400, "Request body must be valid JSON");
  }

  // 更新するフィールドを収集
  const updates: Record<string, unknown> = {};
  if (parsed.title !== undefined) {
    if (typeof parsed.title !== "string" || parsed.title.trim() === "") {
      return errorResponse(400, "title must be a non-empty string");
    }
    updates.title = parsed.title.trim();
  }
  if (parsed.completed !== undefined) {
    if (typeof parsed.completed !== "boolean") {
      return errorResponse(400, "completed must be a boolean");
    }
    updates.completed = parsed.completed;
  }

  // 更新するフィールドがない場合はエラーを返す（空フィールドの更新を防ぐ）
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    return errorResponse(400, "No valid fields to update");
  }

  // DynamoDBのUpdateCommandを使用してタスクを更新
  const setExpression = fields
    .map((field) => `#${field} = :${field}`)
    .join(", ");
  // #は名前のプレースホルダー
  const names = Object.fromEntries(fields.map((field) => [`#${field}`, field]));
  // :は値のプレースホルダー
  const values = Object.fromEntries(
    fields.map((field) => [`:${field}`, updates[field]]),
  );

  const result = await documentClient
    .send(
      new UpdateCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${setExpression}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        // タスクが存在しない場合は更新せずにエラーを返す
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_NEW",
      }),
    )
    .catch((error: unknown) => {
      if (isConditionalCheckFailed(error)) {
        return undefined;
      }
      throw error;
    });

  if (!result) {
    return errorResponse(404, "Task not found");
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Attributes),
  };
};

const isConditionalCheckFailed = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "ConditionalCheckFailedException";

const errorResponse = (
  statusCode: number,
  message: string,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});
