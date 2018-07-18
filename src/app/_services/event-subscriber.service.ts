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
		}
	}

	reset(key) {
		this._events.unsubscribe(key, this.handlers[key]);
		this.handlers[key] = undefined;
	}

}