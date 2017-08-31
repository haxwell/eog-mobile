import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';
import { SearchUsersPage } from '../searchUsers/searchUsers';
import { RequestsIncomingPage } from '../requests/incoming/requests.incoming';
import { RequestsOutgoingPage } from '../requests/outgoing/requests.outgoing';

import { WebsocketService } from '../../app/_services/websocket.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private _websocketService: WebsocketService) {

  }

  ngOnInit() {
    if (!this._websocketService.isInitialized())
      this._websocketService.init();
  }

  onProfileBtnTap(event) {
  	this.navCtrl.push(ProfilePage);
  }

  onSearchForUsersBtnTap(event) {
    this.navCtrl.push(SearchUsersPage);
  }

  onSearchForThingsBtnTap(event) {
    this.navCtrl.push(SearchPage);
  }

  onIncomingReqBtnTap(event) {
  	this.navCtrl.push(RequestsIncomingPage);
  }

  onOutgoingReqBtnTap(event) {
  	this.navCtrl.push(RequestsOutgoingPage);
  }

}
