import { Injectable } from '@angular/core';

import { ToastController } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';

import { Constants } from '../../_constants/constants';
import { environment } from '../../_environments/environment';

import Stomp from 'stompjs';

@Injectable()
export class WebsocketService {

	client = undefined;

	constructor(private _userService: UserService,
				private toastCtrl: ToastController,
				private _constants: Constants) { 

	}

	init() {
		let user = this._userService.getCurrentUser();
		let self = this;
		if (self.client === undefined) 
			self.client = Stomp.client('ws://' + environment.domainPort + '/notifications');
		
		self.client.connect(user["name"], user["password"], () => { 
			console.log("STOMP client connected.");
			self.client.subscribe("/user/queue/message", (data) => {
				console.log(data);

				let toast = this.toastCtrl.create({
					message: self.getMessage(data),
					duration: 4000,
					position: 'top'
				});
				toast.present();
			});
		});
	}

	isInitialized() {
		return this.client !== undefined && this.client["connected"] === true;
	}

	getMessage(data) {
		let obj = JSON.parse(data["body"]);
		
		if (obj["request"] !== undefined) {
			let request = obj["request"];
			let dou_realname = obj["directionallyOppositeUser"]["realname"];

			if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING && request["requestingStatusId"] === null) {
				return dou_realname + ' just requested you do your Thing, ' + obj["request"]["thing"]["title"];
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED && request["requestingStatusId"] === null) {
				return dou_realname + ' just accepted your request, ' + obj["request"]["thing"]["title"];
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED && request["requestingStatusId"] === null) {
				return dou_realname + ' declined your request, ' + obj["request"]["thing"]["title"];
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === null) {
				return dou_realname + ' just marked your request, ' + obj["request"]["thing"]["title"] + ' as completed.';
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED && request["requestingStatusId"] === null) {
				return dou_realname + ' just cancelled your request, ' + obj["request"]["thing"]["title"];
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED) {
				return 'You just received ' + request["thing"]["requiredPointsQuantity"] + ' points from ' + dou_realname;
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED) {
				return dou_realname + ' disagrees that your Thing, ' + obj["request"]["thing"]["title"] + ' was completed. Get in touch with them!';
			} else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DELETED) {
				return dou_realname + ' deleted their thing, ' + obj["request"]["thing"]["title"] + ', so your request was removed, too.';
			}
		} else if (obj["recommendation"] !== undefined) {
			return "You just received a recommendation from " + obj["directionallyOppositeUser"]["realname"];
		} else if (obj["points"] !== undefined) {
			return "You just received a point from " + obj["directionallyOppositeUser"]["realname"];
		}

		return 'Something interesting just happened!';
	}
}
