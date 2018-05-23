import { Injectable } from '@angular/core';

import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RequestsService } from '../../app/_services/requests.service';
import { DeclineReasonCodeService } from '../../app/_services/declined-reason-codes.service';

import { Constants } from '../../_constants/constants';
import { environment } from '../../_environments/environment';

import Stomp from 'stompjs';

@Injectable()
export class WebsocketService {

	client = undefined;

	constructor(private _requestsService: RequestsService,
				private _declineReasonCodeService: DeclineReasonCodeService,
				private toastCtrl: ToastController,
				private _constants: Constants,
				public _events: Events) { 

				this._events.subscribe('app:login', (currentUser) => { this.init(currentUser); })
	}

	init(currentUser) {
		let user = currentUser;
		let self = this;
		if (self.client !== undefined) {
			self.client.disconnect(() => { self.client = undefined; });
		}

		self.client = Stomp.client('ws://' + environment.domainPort + '/notifications');
		
		let lowercaseUserName: String = user["name"];
		lowercaseUserName = lowercaseUserName.toLowerCase();

		self.client.connect(lowercaseUserName, user["password"], () => { 
			console.log("STOMP client connected.");
			self.client.subscribe("/user/queue/message", (data) => {
				console.log(data);
				self.handle(JSON.parse(data["body"]));
			});
		});
	}

	isInitialized() {
		return this.client !== undefined && this.client["connected"] === true;
	}

	handle(data) {
		if (data["request"] !== undefined) {
			// do some API return value cleanup....
			data["request"]["directionallyOppositeUser"] = Object.assign({}, data["directionallyOppositeUser"]);
			delete data["directionallyOppositeUser"];

			let request = this._requestsService.changePromiseAttributeToPrm(data["request"]); 

			if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING && request["requestingStatusId"] === null) {
				this.handleRequestReceived(data)
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED && request["requestingStatusId"] === null) {
				this.handleRequestAccepted(data);
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED && request["requestingStatusId"] === null) {
				this.handleRequestDeclined(data);
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === null) {
				this.handleRequestCompleted(data); 
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED && request["requestingStatusId"] === null) {
				this.handleRequestCancelled(data);
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED) {
				this.handleRequestCompletedAndApproved(data); 
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED) {
				this.handleRequestIsInDispute(data); 
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_RESOLVED_BUT_DISPUTED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED) {
				this.handleRequestWasInamicablyResolved(data);
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED) {
				this.handleDeclinedRequestWasAcknowledged(data);
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED) {
				this.handleCancelledRequestWasAcknowledged(data);
			}

			else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DELETED) {
				this.handleRequestDeleted(data); 
			}
		} else if (data["recommendation"] !== undefined) {

			data["recommendation"]["directionallyOppositeUser"] = Object.assign({}, data["directionallyOppositeUser"]);
			delete data["directionallyOppositeUser"];

			this.handleRecommendationReceived(data); 
		} else if (data["points"] !== undefined) {

			data["points"]["directionallyOppositeUser"] = Object.assign({}, data["directionallyOppositeUser"]);
			delete data["directionallyOppositeUser"];

			this.handlePointsReceived(data); 
		}
	}

	presentToast(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 8000,
			position: 'top'
		});
		toast.present();
	}

	handleRequestReceived(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' wants to take you up on your Promise, ' + request["prm"]["title"];

		this.presentToast(data["message"]);
		this._events.publish('request:received', data);
	}

	handleRequestAccepted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' just accepted your request, ' + request["prm"]["title"];

		this.presentToast(data["message"]);
		this._events.publish('request:accepted', data);
	}

	handleRequestDeclined(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this._declineReasonCodeService.getDeclineReasonCodes().then((drcs: Array<Object>) => {
			if (request["declinedReasonCode"] === null) {
				request["declinedReasonCode"] = {id: undefined, text: undefined};
			} else {
				let drc = drcs.find((obj) => { return obj["id"] === request["declinedReasonCode"] });
				request["declinedReasonCode"] = {id: drc["id"], text: drc["text"]};
			}
		});

		data["message"] = dou_realname + ' has declined your request, ' + request["prm"]["title"] + ".";

		this.presentToast(data["message"]);
		this._events.publish('request:declined', data);
	}

	handleRequestCompleted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' just marked your request, ' + request["prm"]["title"] + ' as completed.';

		this.presentToast(data["message"]);
		this._events.publish('request:completed', data);
	}

	handleRequestCancelled(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' just cancelled your request, ' + request["prm"]["title"];

		this.presentToast(data["message"]);
		this._events.publish('request:cancelled', data);
	}

	handleRequestCompletedAndApproved(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' approved your completion, and sent you ' + data["pointsSent"] + ' points for ' + request["prm"]["title"] + '.';

		this.presentToast(data["message"]);

		console.log("*** Throwing request:completedAndApproved event....")
		this._events.publish('request:completedAndApproved', data);
	}

	handleRequestIsInDispute(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' disagrees that your Promise, ' + request["prm"]["title"] + ' was completed. Get in touch with them!';

		this.presentToast(data["message"]);
		this._events.publish('request:isInDispute', data);
	}

	handleRequestWasInamicablyResolved(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' inamicably resolved the request, ' + request["prm"]["title"] + '. It is done. ';
		if (data["pointsSent"])
			data["message"] += 'You got ' + data["pointsSent"] + ' points.';

		this.presentToast(data["message"]);
		this._events.publish('request:inamicablyResolved', data);
	}

	handleRequestDeleted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		data["message"] = dou_realname + ' deleted their Promise, ' + request["prm"]["title"] + ', so your request was removed, too.';

		this.presentToast(data["message"]);
		this._events.publish('request:deleted', data);
	}

	handleRecommendationReceived(data) {
		let recommendation = data["recommendation"];
		let dou_realname = recommendation["directionallyOppositeUser"]["realname"];

		data["message"] = "You just received a recommendation from " + dou_realname;

		this.presentToast(data["message"]);
		this._events.publish('recommendation:received', data);
	}

	handlePointsReceived(data) {
		let points = data["points"];
		let dou_realname = points["directionallyOppositeUser"]["realname"];

		data["message"] = "You just received a point from " + dou_realname;

		this.presentToast(data["message"]);
		this._events.publish('points:received', data);
	}

	handleDeclinedRequestWasAcknowledged(data) {
		this._events.publish('request:declined:acknowledged', data);
	}

	handleCancelledRequestWasAcknowledged(data) {
		this._events.publish('request:cancelled:acknowledged', data);
	}
}
