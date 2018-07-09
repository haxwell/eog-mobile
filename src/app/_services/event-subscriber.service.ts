import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

@Injectable()
export class EventSubscriberService { 

	handlers = [];

	constructor(private _events: Events) { 

	}

	subscribe(key, handler) {

		if (!this.handlers[key]) {
			this.handlers[key] = handler;
			this._events.subscribe(key, handler)
			console.log("*1a subscribed to " + key + " event")
		} else {
			console.log("** " + key + " has already been subscribed to")
		}

	}

	reset(key) {
		this._events.unsubscribe(key, this.handlers[key]);
		this.handlers[key] = undefined;

		console.log("*1a " + key + " has been UNsubscribed");
	}

}