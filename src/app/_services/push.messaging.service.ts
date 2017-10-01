import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Platform, AlertController } from 'ionic-angular';
import { Push } from '@ionic-native/push';
//import { PushObject, PushOptions } from '@ionic-native/push';

import { UserService } from '../../app/_services/user.service';
import { ApiService } from '../../app/_services/api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class PushMessagingService {

	client = undefined;

	constructor(private platform: Platform,
				private _userService: UserService,
				private _apiService: ApiService,
				public _events: Events,
				public push: Push, 
				public alertCtrl: AlertController) { 

	}

	init() {
	    if (!this.platform.is('cordova')) {
	      console.warn('Push notifications not initalized. Run in physical device.');
	      return;
	    }

	    const options = { 
	      android: { senderID: '386608926885' }
	    };

	    const pushObject = this.push.init(options);

	    let self = this;
	    pushObject.on('registration').subscribe((data: any) => {
			console.log('device token -> ' + data.registrationId);
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/users/" + user["id"] + "/deviceId";
			let postData = this.JSON_to_URLEncoded({deviceId: data.registrationId}, undefined, undefined);

			self._apiService.post(url, postData).subscribe((resp) => { }, (err) => { console.log(JSON.stringify(err)); })
	    });

	    pushObject.on('notification').subscribe((data: any) => {
	      console.log('message: ' + data.message );

	      // if user using app and push notification comes
	      if (data.additionalData.foreground) {

	      	// TODO: Use the same code as if this came through the websocket.service
	      	console.log("Application open, push notification received! " + data.message);

	        // if application open, show popup
//	        let confirmAlert = this.alertCtrl.create({
//	          title: 'New Notification',
//	          message: data.message,
//	          buttons: [{
//	            text: 'Ignore',
//	            role: 'cancel'
//	          }, {
//	            text: 'View',
//	            handler: () => {
//	              console.log('This is the view handler: ' + data.message);
//	            }
//	          }]
//	        });
//	        confirmAlert.present();
	      } else {
	        // if user NOT using app and push notification comes
	        // TODO: Your logic on click of push notification directly
	        //
	        console.log('Push notification clicked!');
	      }
	    });

	    pushObject.on('error').subscribe((obj) => { console.error('Error with Push Plugin-- ' + obj); });
	}

	JSON_to_URLEncoded(element,key,list){
  		var list = list || [];
  		if(typeof(element)=='object'){
    		for (var idx in element)
      			this.JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
  		} else {
    		list.push(key+'='+encodeURIComponent(element));
  		}
  		
  		return list.join('&');
	}
}
