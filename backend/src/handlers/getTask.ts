import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  // パスパラメータからタスクIDを取得
  const id = event.pathParameters?.id;
  if (!id) {
    return errorResponse(400, "id is required");
  }

  // DynamoDBから特定のタスクを取得
  const result = await documentClient.send(
    new GetCommand({ TableName: TASKS_TABLE, Key: { id } }),
  );

  if (!result.Item) {
    return errorResponse(404, "Task not found");
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Item),
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
