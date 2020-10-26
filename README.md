# serverless_app

##Requisiti##

AWS account
Node.js
AWS CLI and configure it

npm install serverless -g

DB
Una sola tabella per salvare utenti e appuntamenti

Chiave: (PK, SK)
PK usato per ID utente
SK usato per ID appuntamento

User ha i campi: firstname, surname, username
Appointment ha i campi: dtstart dtend

CLONARE LA REPOSITORY
npm install
serverless deploy -v

FORMATO DATA: 2020-10-25T22:00:00Z

Esempi di chiamate dal prompt dei comandi di windows

1) saveUser
curl -H \"Content-Type: application/json\" -X POST -d "{\"firstname\":\"eu\",\"surname\": \"leo\", \"username\":\"euleo\"}" https://amazonaws/dev/user

funziona anche se firstname è un numero
Non si possono salvare utenti con username uguale

2) SaveAppointment
fallisce se l'utente non esiste
fallisce se l'orario è già occupato

curl -H \"Content-Type: application/json\" -X POST -d "{\"userId\":\"9b1b3550-1756-11eb-baa8-b5196fec8764\",\"dt_start\":\"2020-10-25T22:00:00Z\",\"dt_end\": \"2020-10-25T22:30:00Z\"}" https://amazonaws/dev/appointment

userId è la PK dell’utente

3) getUsers
curl https://amazonaws/dev/users

4) getAppointments
curl https://amazonaws/dev/appointments

5)deleteUser (with all his appointments)
curl -X DELETE https://amazonaws/dev/user/67af4c90-177b-11eb-b1be-b7a87132da47

6)deleteAppointment
curl -H \"Content-Type: application/json\" -X DELETE -d "{\"userId\":\"a0794350-177b-11eb-b1be-b7a87132da47\"}" https://amazonaws/dev/appointment/c58eabd0-177b-11eb-bef5-f1b7f7a33add

7)putUser
curl -H \"Content-Type: application/json\" -X PUT -d "{\"firstname\":\"eugenio\",\"surname\":\"leonetti\"}" https://amazonaws/dev/user/44e403b0-1792-11eb-b6ba-872da45fb60b

8)putAppointment
curl -H \"Content-Type: application/json\" -X PUT -d "{\"userId\":\"872e0d40-178a-11eb-9f40-a1e3d639a24c\",\"dt_start\":\"2020-10-25T22:00:00Z\",\"dt_end\": \"2020-10-25T22:30:00Z\"}" https://amazonaws/dev/appointment/appointment_3c214b40-178b-11eb-9cbd-2778c1948f2b
