# serverless_app

##Requisiti##

AWS account

Node.js

AWS CLI

##DynamoDB##

Una sola tabella per salvare utenti e appuntamenti

Chiave: (PK, SK)

PK usato per userId

SK usato per user/appuntamentoId

User ha i campi: firstname, surname, username

Appointment ha i campi: dt_start, dt_end (FORMATO DATE: 2020-10-25T10:00:00Z)

##SETUP##

clonare repository

npm install

npm install serverless -g

serverless deploy -v

##Esempi di chiamate dal prompt dei comandi di windows##

1) saveUser

curl -H \"Content-Type: application/json\" -X POST -d "{\"firstname\":\"myname\",\"surname\": \"mysrurname\", \"username\":\"myusername\"}" https://amazonaws/dev/user


2) SaveAppointment

curl -H \"Content-Type: application/json\" -X POST -d "{\"userId\":\"{userId}\",\"dt_start\":\"2020-10-25T22:00:00Z\",\"dt_end\": \"2020-10-25T22:30:00Z\"}" https://amazonaws/dev/appointment


3) getUsers

curl https://amazonaws/dev/users


4) getAppointments

curl https://amazonaws/dev/appointments


5)deleteUser (with all his appointments)

curl -X DELETE https://amazonaws/dev/user/{userId}


6)deleteAppointment

curl -H \"Content-Type: application/json\" -X DELETE -d "{\"userId\":\"{userId}\"}" https://amazonaws/dev/appointment/{appointmentId}


7)putUser

curl -H \"Content-Type: application/json\" -X PUT -d "{\"firstname\":\"myname2\",\"surname\":\"mysurname2\",\"username\":\"myusername2\"}" https://amazonaws/dev/user/{userId}


8)putAppointment

curl -H \"Content-Type: application/json\" -X PUT -d "{\"userId\":\"{userId}\",\"dt_start\":\"2020-10-25T22:00:00Z\",\"dt_end\": \"2020-10-25T22:30:00Z\"}" https://amazonaws/dev/appointment/{appointmentId}
