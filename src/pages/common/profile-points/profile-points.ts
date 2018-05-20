import { Component } from '@angular/core';

import { PointsService } from '../../../app/_services/points.service'
import { UserService } from '../../../app/_services/user.service'
import { ProfileService } from '../_services/profile.service'

import { Events } from 'ionic-angular';

@Component({
  selector: 'profile-points',
  templateUrl: 'profile-points.html'
})

export class ProfilePoints {

	totalPoints = undefined;
	availablePoints = undefined;
	profileModel = undefined;

	constructor( private _events: Events,
				 private _pointsService : PointsService
				,private _profileService : ProfileService
				,private _userService : UserService ) {

		let func = (data) => {
			this._pointsService.init();
			this._profileService.init(this._userService.getCurrentUser());

			this.ngOnInit();
		};


		this._events.subscribe('points:received', func);
		this._events.subscribe('request:saved', func);
		this._events.subscribe('request:declined', func);
		this._events.subscribe('request:cancelled', func);
		this._events.subscribe('request:completedAndApproved', func);
		this._events.subscribe('request:inamicablyResolved', func);

		this.currentUser = this._userService.getCurrentUser();
	}

	ngOnInit() {
		this._pointsService.getCurrentAvailableUserPoints().then((caPoints) => {
			this.availablePoints = caPoints;
		});

		this._pointsService.getCurrentUserPointsAsSum().then((sumPoints) => {
			this.totalPoints = sumPoints;
		});

		// this.profileModel = this._profileService.getModel(this.currentUser["id"]);
	}

	getAllTimePointsCount() {
		return this._profileService.getModel(this.currentUser["id"])["allTimePointCount"];
	}
}
