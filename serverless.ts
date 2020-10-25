import type { Serverless } from 'serverless/aws';

const SERVICE_NAME = "appointment-api";
const DYNAMO_TABLE = `${SERVICE_NAME}-dev`;

const serverlessConfiguration: Serverless = {
  service: {
    name: 'appointment',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    stage: "dev",
    region: "us-east-1",
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DYNAMO_TABLE
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: "*",
      }
    ],
  },
  functions: {
    saveUser: {
      handler: 'handler.saveUser',
      events: [
        {
          http: {
            method: 'post',
            path: 'user',
          }
        }
      ]
    },
    saveAppointment: {
      handler: 'handler.saveAppointment',
      events: [
        {
          http: {
            method: 'post',
            path: 'appointment',
          }
        }
      ]
    },
    appointments: {
      handler: 'handler.getAppointments',
      events: [
        {
          http: {
            method: 'get',
            path: 'appointments',
          }
        }
      ]
    },
    users: {
      handler: 'handler.getUsers',
      events: [
        {
          http: {
            method: 'get',
            path: 'users',
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      UsersDynamoTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Retain",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "PK",
              AttributeType: "S",
            },
            {
              AttributeName: "SK",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "PK",
              KeyType: "HASH",
            },
            {
              AttributeName: "SK",
              KeyType: "RANGE",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: DYNAMO_TABLE,
        },
      },
    },
  },
}

module.exports = serverlessConfiguration;
