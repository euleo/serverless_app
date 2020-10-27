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
  userId: string;
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
  const { userId, dt_start, dt_end } = requestBody;

  const params1 = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': userId,
      ':sk': 'user'
    }
  };

  try {
    //check if user exists
    const user = await dynamoDB.scan(params1).promise();

    if (user['Count'] > 0) {

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
            SK: 'appointment_' + uuid.v1(),
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
    FilterExpression: 'begins_with(SK, :sk)',
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

export const deleteUser: APIGatewayProxyHandler = async (event, _context) => {
  //delete user and his appointments
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      PK: event.pathParameters.id,
      SK: 'user'
    },
  };

  try {
    await dynamoDB.delete(params).promise();

    const params1 = {
      TableName: process.env.DYNAMO_TABLE,
      FilterExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': event.pathParameters.id,
        ':sk': 'appointment'
      }
    }

    const appointments = await dynamoDB.scan(params1).promise();
    for (let i = 0; i < appointments['Items'].length; i++) {
      const params2 = {
        TableName: process.env.DYNAMO_TABLE,
        Key: {
          "PK": event.pathParameters.id,
          "SK": appointments['Items'][i]['SK']
        }
      };
      await dynamoDB.delete(params2).promise();
    } 

    return {
      statusCode: 200,
      body: JSON.stringify("User and his appointments succesfully deleted"),
    };

  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};

export const deleteAppointment: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody = JSON.parse(event.body);
  const PK = requestBody.userId;

  //delete appointment
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    Key: {
      "PK": PK,
      "SK": event.pathParameters.id
    }
  };

  try {
    await dynamoDB.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify('Appointment successfully deleted'),
    };
  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};

export const updateUser: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody = JSON.parse(event.body);
  const firstname = requestBody.firstname;
  const surname = requestBody.surname;
  const username = requestBody.username;

  //update User by PK and SK
  const params = {
    TableName: process.env.DYNAMO_TABLE,
    Item: {
      PK: event.pathParameters.id,
      SK: 'user',
      firstname,
      surname,
      username
    },
  };

  try {
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

export const updateAppointment: APIGatewayProxyHandler = async (event, _context) => {
  const requestBody = JSON.parse(event.body);
  const PK = requestBody.userId;
  const dt_start = requestBody.dt_start;
  const dt_end = requestBody.dt_end;

  //check if new appointment overlaps
  const params2 = {
    TableName: process.env.DYNAMO_TABLE,
    FilterExpression: ':dt_start < dt_end AND :dt_end > dt_start',
    ExpressionAttributeValues: {
      ':dt_start': dt_start,
      ':dt_end': dt_end
    }
  };

  try {
    const data = await dynamoDB.scan(params2).promise();

    if (data['Count'] == 0) {
      //update Appointment
      const params = {
        TableName: process.env.DYNAMO_TABLE,
        Item: {
          PK: PK,
          SK: event.pathParameters.id,
          dt_start,
          dt_end
        }
      };

      await dynamoDB.put(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify('Appointment successfully updated'),
      };
    } else {
      return getErrorResponse("Appointment overlaps");
    }
  } catch (err) {
    console.error(err);
    return getErrorResponse(err);
  }
};