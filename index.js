//Import dependencies
import {
	AutojoinRoomsMixin,
	MatrixClient,
	SimpleFsStorageProvider,
	RichRepliesPreprocessor,
} from "matrix-bot-sdk";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import axios from "axios";

//Parse YAML configuration file
const loginFile = readFileSync("./db/login.yaml", "utf8");
const loginParsed = parse(loginFile);
const homeserver = loginParsed["homeserver-url"];
const accessToken = loginParsed["login-token"];
const prefix = loginParsed.prefix;
const msgLimit = loginParsed["msg-limit"];

//keep track of whos ranting
const rants = new Map();

//the bot sync something idk bro it was here in the example so i dont touch it ;-;
const storage = new SimpleFsStorageProvider("bot.json");

//login to client
const client = new MatrixClient(homeserver, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

//do not include replied message in message
client.addPreprocessor(new RichRepliesPreprocessor(false));

const filter = {
	//dont expect any presence from m.org, but in the case presence shows up its irrelevant to this bot
	presence: { senders: [] },
	room: {
		//ephemeral events are never used in this bot, are mostly inconsequentail and irrelevant
		ephemeral: { senders: [] },
		//we fetch state manually later, hopefully with better load balancing
		state: {
			senders: [],
			types: [],
			lazy_load_members: true,
		},
		//we dont need much room history, just enough to catch recent messages just before the bot came online
		timeline: {
			limit: 20,
		},
	},
};

//Start Client
client.start(filter).then(async (filter) => {
	console.log("Client started!");
});

//when the client recieves an event
client.on("room.event", async (roomId, event) => {
	//ignore events sent by self, unless its a banlist policy update
	if (event.sender === client.getUserId()) {
		return;
	}

	//we just want raw text tbh
	if (!event?.content?.body) return;

	const body = event.content.body.toLowerCase();

	if (body.startsWith(`${prefix}help`)) {
		client.replyNotice(
			roomId,
			event,
			"You can find usage information and source code available at https://github.com/jjj333-p/inspirobot-disruptor-matrix",
		);
	} else if (body.startsWith(`${prefix}inspire`)) {
		//api to generate a quote image
		let imageUrl;
		try {
			const r = await axios.get("https://inspirobot.me/api?generate=true");
			imageUrl = r.data;
		} catch (e) {
			console.warn(`Failed to generate inspirational quote with error\n${e}`);
			client.replyNotice(
				roomId,
				event,
				"Unable to generate an inspiring quote",
			);
		}

		//upload it
		let mxc;
		try {
			mxc = await client.uploadContentFromUrl(imageUrl);
		} catch (e) {
			console.warn(`Failed to upload inspirational quote with error\n${e}`);
			client.replyNotice(roomId, event, "Unable to upload the inspiring quote");
		}

		//generate content to send
		const eventContent = {
			body: "inspiration.jpg",
			info: { "agency.pain.image-origin": imageUrl },
			msgtype: "m.image",
			url: mxc,
			"m.relates_to": {
				"m.in_reply_to": {
					event_id: event.event_id,
				},
			},
			"m.mentions": {
				user_ids: [event.sender],
			},
		};

		client.sendRawEvent(roomId, "m.room.message", eventContent);
	} else {
		let rantData = rants.get(roomId);
		if (rantData?.user === event.sender) {
			rantData.count++;
		} else {
			const d = {
				user: event.sender,
				count: 1,
			};
			rants.set(roomId, d);
			rantData = d;
		}

		if (rantData.count >= msgLimit) {
			rants.delete(roomId);

			//api to generate a quote image
			let imageUrl;
			try {
				const r = await axios.get("https://inspirobot.me/api?generate=true");
				imageUrl = r.data;
			} catch (e) {
				console.warn(`Failed to generate inspirational quote with error\n${e}`);
				client.sendNotice(roomId, "Unable to generate an inspiring quote");
			}

			//upload it
			let mxc;
			try {
				mxc = await client.uploadContentFromUrl(imageUrl);
			} catch (e) {
				console.warn(`Failed to upload inspirational quote with error\n${e}`);
				client.sendNotice(roomId, "Unable to upload the inspiring quote");
			}

			//generate content to send
			const eventContent = {
				body: "inspiration.jpg",
				info: { "agency.pain.image-origin": imageUrl },
				msgtype: "m.image",
				url: mxc,
				"m.relates_to": {
					"m.in_reply_to": {
						event_id: event.event_id,
					},
				},
				"m.mentions": {
					user_ids: [event.sender],
				},
			};

			client.sendRawEvent(roomId, "m.room.message", eventContent);
		}
	}
});
