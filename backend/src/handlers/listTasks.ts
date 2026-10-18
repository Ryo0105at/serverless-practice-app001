import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { documentClient, TASKS_TABLE } from "../dynamodb";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const result = await documentClient.send(
    new ScanCommand({ TableName: TASKS_TABLE }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Items ?? []),
  };
};
