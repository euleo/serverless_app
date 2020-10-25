import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";
import 'source-map-support/register';

type userRequestParams = {
  name: string;
  surname: string;
};

type appointmentRequestParams = {
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
  const { name, surname } = requestBody;

  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE,
      Item: {
        PK: uuid.v1(),
        SK: 'user',
        name,
        surname
      },
    };
    await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};

export const saveAppointment: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody: appointmentRequestParams = JSON.parse(event.body);
  const { dt_start, dt_end } = requestBody;

  const params = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: ':dt_start < dt_end AND :dt_end > dt_start',
    ExpressionAttributeValues: {
      ':dt_start': dt_start,
      ':dt_end': dt_end
    }
  };

  try {
    //check if appointment overlaps
    const data = await dynamoDB.scan(params).promise();

    if (data['Count'] == 0) {
      try {
        const params1 = {
          TableName: process.env.DYNAMO_TABLE,
          Item: {
            PK: uuid.v1(),
            SK: 'appointment',
            dt_start,
            dt_end
          },
        };

        await dynamoDB.put(params1).promise();

        return {
          statusCode: 200,
          body: JSON.stringify(params1.Item),
        };
      } catch (err) {
        console.error(err);
        return getErrorResponse(err);
      }
    } else {
      return getErrorResponse("Appointment overlaps");
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
