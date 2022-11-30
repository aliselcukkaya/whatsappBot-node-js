# whatsappBot-node-js
This project was built using [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
Used MongoDB for to store commands in a local database.

You can configure bot to answer messages that includes specific words(triggers).

Main objective of this project is adding new commands without changing any of the code.
<img width="515" alt="Screenshot 2022-11-30 at 13 50 15" src="https://user-images.githubusercontent.com/44002494/204781869-d39fc21e-d3a7-4f4d-8000-1a609cf1172a.png">

# Commands
*/add [commandName]* => a command should have a command name

*/addtrigger [commandName] [triggers]* => specify a command name to add trigger, you can add multiple triggers (hi,hey,hello) for to trigger a command

*/addreply [commandName] [reply]* => add reply to a command, if someone sends a message that includes one of the triggers then reply

*/delete [commandName]* => deletes command

*/commands* => gives you all the commands

*/command [commandName]* => gives you details about specified command
