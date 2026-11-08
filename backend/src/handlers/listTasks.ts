import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";
import { successResponse } from "../http";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const result = await documentClient.send(
    new ScanCommand({ TableName: TASKS_TABLE }),
  );

  return successResponse(200, result.Items ?? []);
};
