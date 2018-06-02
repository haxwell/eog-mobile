import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

@Injectable()
export class UnseenChangesIndicatorService { 
	
	model = {};

	constructor(private _events: Events) {

		let funcIncoming = () => {
			this.model["incoming"] = true;
		}

		let funcOutgoing = () => {
			this.model["outgoing"] = true;
		}

		let funcNotification = () => {
			this.model["notification"] = true;
		}

		this._events.subscribe("request:received", funcIncoming)
		this._events.subscribe("request:accepted", funcOutgoing)
		this._events.subscribe("request:declined", funcOutgoing)
		this._events.subscribe("request:completed", funcOutgoing)
		this._events.subscribe("request:cancelled", funcOutgoing)
		this._events.subscribe("request:notYetAccepted:cancelledByRequestor", funcNotification)
		this._events.subscribe("request:accepted:cancelledByRequestor", funcNotification)
		this._events.subscribe("request:completedAndApproved", funcNotification)
		this._events.subscribe("request:isInDispute", funcIncoming)
		this._events.subscribe("request:inamicablyResolved", funcIncoming)
		this._events.subscribe("recommendation:received", funcNotification)
		this._events.subscribe("points:received", funcNotification)
	}

	init() {

	}

	areIncomingUnseenChanges() {
		return this.model["incoming"];
	}

	resetIncomingUnseenChanges() {
		this.model["incoming"] = false;
	}

	areOutgoingUnseenChanges() {
		return this.model["outgoing"];
	}

	resetOutgoingUnseenChanges() {
		this.model["outgoing"] = false;
	}

	areNotificationUnseenChanges() {
		return this.model["notification"];
	}

	resetNotificationUnseenChanges() {
		this.model["notification"] = false;
	}
}

