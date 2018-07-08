import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

@Injectable()
export class EventSubscriberService { 

	subs = [];
	handlers = [];

	constructor(private _events: Events) { 

	}

	subscribe(key, handler) {

		if (!this.subs[key]) {
			this.subs[key] = 1;
			this.handlers[key] = handler;
			this._events.subscribe(key, handler)
			console.log("*1a subscribed to " + key + " event")
		} else {
			console.log("** " + key + " has already been subscribed to")
		}

	}

}