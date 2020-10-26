import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";
import 'source-map-support/register';

type userRequestParams = {
  firstname: string;
  surname: string;
  username: string;
};

type appointmentRequestParams = {
  username: string;
  dt_start: string;
  dt_end: string;
};

const dynamoDB = new DynamoDB.DocumentClient();

const getErrorResponse = (errorMessage: string) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: errorMessage,
    }),
  };
};

export const saveUser: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody: userRequestParams = JSON.parse(event.body);
  const { firstname, surname, username } = requestBody;

  const params1 = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    }
  };

  try {
    //check if user already exists
    const user = await dynamoDB.scan(params1).promise();

    if (user['Count'] == 0) {
      const params = {
        TableName: process.env.DYNAMO_TABLE,
        Item: {
          PK: uuid.v1(),
          SK: 'user',
          firstname,
          surname,
          username
        },
      };
      await dynamoDB.put(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(params.Item),
      };
    } else {
      return getErrorResponse("User already exist");
    }

  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};

export const saveAppointment: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody: appointmentRequestParams = JSON.parse(event.body);
  const { username, dt_start, dt_end } = requestBody;

  const params1 = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    }
  };

  try {
    //check if user exists and get PK
    const user = await dynamoDB.scan(params1).promise();

    if (user['Count'] > 0) {
      let userId = user['Items'][0]['PK'];

      const params2 = {
        TableName: process.env.DYNAMO_TABLE,
        FilterExpression: ':dt_start < dt_end AND :dt_end > dt_start',
        ExpressionAttributeValues: {
          ':dt_start': dt_start,
          ':dt_end': dt_end
        }
      };

      //check if appointment overlaps
      const data = await dynamoDB.scan(params2).promise();

      if (data['Count'] == 0) {
        const params3 = {
          TableName: process.env.DYNAMO_TABLE,
          Item: {
            PK: userId,
            SK: 'appointment',
            dt_start,
            dt_end
          },
        };

        await dynamoDB.put(params3).promise();

        return {
          statusCode: 200,
          body: JSON.stringify(params3.Item),
        };

      } else {
        return getErrorResponse("Appointment overlaps");
      }

    } else {
      return getErrorResponse("User doesn't exist");
    }

  } catch (err) {
    return getErrorResponse(err);
  }
};

export const getAppointments: APIGatewayProxyHandler = async (event, _context) => {
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: 'SK = :sk',
    ExpressionAttributeValues: {
      ':sk': 'appointment'
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return getErrorResponse(err);
  }
};

export const getUsers: APIGatewayProxyHandler = async (event, _context) => {
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: 'SK = :sk',
    ExpressionAttributeValues: {
      ':sk': 'user'
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return getErrorResponse(err);
  }
};
