import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";
import { errorResponse, isConditionalCheckFailed } from "../http";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  // パスパラメータからタスクIDを取得
  const id = event.pathParameters?.id;
  if (!id) {
    return errorResponse(400, "id is required");
  }

  const result = await documentClient
    .send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        // タスクが存在しない場合は削除せずにエラーを返す
        ConditionExpression: "attribute_exists(id)",
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

  return { statusCode: 204, body: "" };
};
