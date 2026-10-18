import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient(endpoint ? { endpoint } : {});

export const documentClient = DynamoDBDocumentClient.from(client);

export const TASKS_TABLE = process.env.TASKS_TABLE ?? "tasks";
