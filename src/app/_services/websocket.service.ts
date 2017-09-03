import { Injectable } from '@angular/core';

import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';

import { Constants } from '../../_constants/constants';
import { environment } from '../../_environments/environment';

import Stomp from 'stompjs';

@Injectable()
export class WebsocketService {

	client = undefined;

	constructor(private _userService: UserService,
				private toastCtrl: ToastController,
				private _constants: Constants,
				public _events: Events) { 

	}

	init() {
		let user = this._userService.getCurrentUser();
		let self = this;
		if (self.client !== undefined) {
			self.client.disconnect(() => { self.client = undefined; });
		}

		self.client = Stomp.client('ws://' + environment.domainPort + '/notifications');
		
		self.client.connect(user["name"], user["password"], () => { 
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
			data["request"]["directionallyOppositeUser"] = Object.assign({}, data["directionallyOppositeUser"]);
			delete data["directionallyOppositeUser"];

			let request = data["request"];

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
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DELETED) {
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
			duration: 4000,
			position: 'top'
		});
		toast.present();
	}

	handleRequestReceived(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' just requested you do your Thing, ' + request["thing"]["title"]);
		this._events.publish('request:received', data);
	}

	handleRequestAccepted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' just accepted your request, ' + request["thing"]["title"]);
		this._events.publish('request:accepted', data);
	}

	handleRequestDeclined(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' has declined your request, ' + request["thing"]["title"]);
		this._events.publish('request:declined', data);
	}

	handleRequestCompleted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' just marked your request, ' + request["thing"]["title"] + ' as completed.');
		this._events.publish('request:completed', data);
	}

	handleRequestCancelled(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' just cancelled your request, ' + request["thing"]["title"]);
		this._events.publish('request:cancelled', data);
	}

	handleRequestCompletedAndApproved(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast('You just received ' + request["thing"]["requiredPointsQuantity"] + ' points from ' + dou_realname);
		this._events.publish('request:completedAndApproved', data);
	}

	handleRequestIsInDispute(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' disagrees that your Thing, ' + request["thing"]["title"] + ' was completed. Get in touch with them!');
		this._events.publish('request:isInDispute', data);
	}

	handleRequestDeleted(data) {
		let request = data["request"];
		let dou_realname = request["directionallyOppositeUser"]["realname"];

		this.presentToast(dou_realname + ' deleted their thing, ' + request["thing"]["title"] + ', so your request was removed, too.');
		this._events.publish('request:deleted', data);
	}

	handleRecommendationReceived(data) {
		let recommendation = data["recommendation"];
		let dou_realname = recommendation["directionallyOppositeUser"]["realname"];

		this.presentToast("You just received a recommendation from " + dou_realname;
		this._events.publish('recommendation:received', data);
	}

	handlePointsReceived(data) {
		let points = data["request"];
		let dou_realname = points["directionallyOppositeUser"]["realname"];

		this.presentToast("You just received a point from " + dou_realname;
		this._events.publish('points:received', data);
	}
}
