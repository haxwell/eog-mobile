import { Injectable } from '@angular/core';

import { UserService } from '../../app/_services/user.service';
import { ApiService } from '../../app/_services/api.service';

import { environment } from '../../_environments/environment';

import Stomp from 'stompjs';

@Injectable()
export class WebsocketService {

	client = undefined;

	constructor(private _apiService: ApiService, 
				private _userService: UserService) { 

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
			});
		});
	}

	isInitialized() {
		return this.client !== undefined && this.client["connected"] === true;
	}

}
