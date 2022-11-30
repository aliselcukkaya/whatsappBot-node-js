const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoClient } = require('mongodb');

//global variables
const ADD = '/add';
const DELETE = '/delete';
const LIST = '/commands';
const LIST_COMMAND = '/command';
const ADD_TRIGGER = '/addtrigger';
const ADD_REPLY = '/addreply';

const CLIENT_ID = 'whatsappSessionNamee';

// DATABASE
const url = 'mongodb://localhost:27017';
const dbClient = new MongoClient(url);
const dbName = 'whatsappCommands';
dbClient.connect();
console.log('Connected successfully to database');
const db = dbClient.db(dbName);
const collection = db.collection('commands');

// ADDING NEW BOT COMMAND
async function addCommand(commandName) {
	var result;
	try {
		result = await collection.insertOne(
			{ commandName: commandName }
		);
	} catch (error) {
		console.log(error);
	}

	if (!result.acknowledged) {
		console.log('Could not add command to database', commandName);
		return 0;
	}
	console.log('Added a new command', result);
	return 1;
}

// DELETING A BOT COMMAND
async function deleteCommand(commandName) {
	var result;
	try {
		result = await collection.deleteOne(
			{ commandName: commandName }
		);
	} catch (error) {
		console.log(error);
	}

	if (!result.acknowledged) {
		console.log('Could not deleted command', result);
		return 0;
	}
	console.log('Deleted a command', result);
	return 1;
}

// LIST ALL COMMANDS
async function listCommands() {
	var commands, onlyCommands = [];
	try {
		commands = await collection.find().project(
			{
				commandName: 1,
				_id: 0
			}
		).toArray();
		for (let index = 0; index < commands.length; index++) {
			let item = commands[index].commandName;
			if (item != undefined)
				onlyCommands.push(item);
		}
	} catch (error) {
		console.log(error);
	}

	console.log('Returning list of commands', onlyCommands);
	return onlyCommands;
}
// LIST ONE COMMAND
async function listOneCommand(commandName) {
	var command, commandReply, commandTriggers;
	try {
		command = await collection.find({
			commandName: commandName
		}).toArray();
		commandTriggers = command[0].triggers;
		commandReply = command[0].reply;
	} catch (error) {
		console.log(error);
	}

	if (command != undefined)
		return `*Command name*: ${commandName}\n*Command triggers*: ${commandTriggers}\n*Command reply*: ${commandReply}`;
}

// GET REPLY
async function getReply(trigger) {
	var triggerReply;
	try {
		triggerReply = await collection.find({
			triggers: trigger
		}).toArray();
		triggerReply = triggerReply[0].reply;
	} catch (error) {
		console.log(error);
	}
	if (triggerReply != undefined)
		return triggerReply;
}

// GET TRIGGERS
async function getTriggers() {
	var onlyTriggers = [];
	try {
		let triggerList = await collection.find().project(
			{
				triggers: 1,
				_id: 0
			}
		).toArray();
		console.log(triggerList);
		for (let index = 0; index < triggerList.length; index++) {
			let item = triggerList[index].triggers;
			if (item != undefined && item.lenght != 0)
				onlyTriggers = onlyTriggers.concat(item);
		}
	} catch (error) {
		console.log(error);
	}
	console.log('Returning list of triggers', onlyTriggers);
	return onlyTriggers;
}

// ADD TRIGGERR TO COMMAND
async function addTrigger(commandName, trigger) {
	var result;
	var triggers = trigger.split(',');
	try {
		result = await collection.updateOne(
			{ commandName: commandName },
			{ $push: { triggers: { $each: triggers } } }
		);
	} catch (error) {
		console.log(error);
	}

	if (!result.acknowledged) {
		console.log('Could not add trigger to database', commandName);
		return 0;
	}
	console.log('Added a new trigger', result);
	return 1;
}

// ADD/UPDATE REPLY TO COMMAND
async function addOrUpdateReply(commandName, reply) {
	try {
		let result = await collection.updateOne(
			{ commandName: commandName },
			{ $set: { reply: reply } }
		);
	} catch (error) {
		console.log(error);
	}
	return 1;
}

// returns given object's index in given string
function nthIndex(str, object, n) {
	var L = str.length, i = -1;
	while (n-- && i++ < L) {
		i = str.indexOf(object, i);
		if (i < 0) break;
	}
	return i;
}

// WHATSAPP
const client = new Client({
	authStrategy: new LocalAuth({ clientId: CLIENT_ID })
});

client.initialize();

client.on('loading_screen', (percent, message) => {
	console.log('LOADING SCREEN', percent, message);
});

client.on('qr', qr => {
	qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
	console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
	// Fired if session restore was unsuccessful
	console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
	console.log('READY');
});


client.on('message', async msg => {
	console.log('MESSAGE RECEIVED', msg.body);
	var result;
	if (msg.body.startsWith('/')) { // if message is a command
		// split given command to parts
		let splittedBody = msg.body.split(' ');
		let command = splittedBody[0];
		let commandName = splittedBody[1];
		let contentStartIndex = nthIndex(msg.body, ' ', 2) + 1;
		let content = msg.body.substring(contentStartIndex);

		// BOT COMMANDS
		//add
		if (command == ADD) {
			result = await addCommand(commandName);
			if (result) client.sendMessage(msg.from, 'Command succesfully added!✅');
			else client.sendMessage(msg.from, 'Command failed to add!⛔');
		} //delete
		else if (command == DELETE) {
			result = await deleteCommand(commandName);
			if (result) client.sendMessage(msg.from, 'Command succesfully deleted!✅');
			else client.sendMessage(msg.from, 'Command failed to delete!⛔');
		} //list
		else if (command == LIST) {
			result = await listCommands();
			client.sendMessage(msg.from, result.toString());
		}// list a command
		else if (command == LIST_COMMAND) {
			result = await listOneCommand(commandName);
			client.sendMessage(msg.from, result);
		}// add trigger
		else if (command == ADD_TRIGGER) {
			result = await addTrigger(commandName, content);
			if (result) client.sendMessage(msg.from, 'Trigger succesfully added!✅');
			else client.sendMessage(msg.from, 'Trigger failed to add!⛔');
		}// add reply
		else if (command == ADD_REPLY) {
			result = await addOrUpdateReply(commandName, content);
			if (result) client.sendMessage(msg.from, 'Reply succesfully added!✅');
			else client.sendMessage(msg.from, 'Reply failed to add!⛔');
		}

		// TRIGGERS
	} else { // if message includes one of the triggers then reply
		(await getTriggers()).forEach(trigger => {
			if (msg.body.includes(trigger)) {
				getReply(trigger).then((reply) => {
					// timeout for to prevent instant reply
					setTimeout(function () { client.sendMessage(msg.from, reply) }, 2000);
				});
			}
		});
	}
});

process.on("SIGINT", async () => {
	console.log("(SIGINT) Shutting down...");
	await client.destroy();
	await dbClient.close();
	process.exit(0);
})