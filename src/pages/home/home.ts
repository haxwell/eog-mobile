import { Component, ViewChild } from '@angular/core';
import { NavController, Navbar, Events, ModalController, AlertController } from 'ionic-angular';
import { TutorialPage } from '../tutorial/tutorial'

import { UserService } from '../../app/_services/user.service'


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(Navbar) navBar: Navbar;

    showTutorialPromise = undefined;

    constructor(public navCtrl: NavController,
                private _modalCtrl: ModalController, 
                private _userService: UserService
    ) {

    }

    ngOnInit() {
        this.showTutorialPromise = this._userService.getShowTutorialOnLogin();
    }

    ionViewWillEnter() {
        let self = this;
        if (self.showTutorialPromise !== undefined && self._userService.getTutorialHasBeenShown() !== true) {
            self.showTutorialPromise.then((b) => {
                if (b === true) {
                    let modal = self._modalCtrl.create(TutorialPage, { });
                  
                    modal.onDidDismiss((data) => { 
                      self._userService.setTutorialHasBeenShown(true);
                    });

                    modal.present();
                }
            });
        }
    }

}
