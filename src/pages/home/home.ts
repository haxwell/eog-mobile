import { Component, ViewChild } from '@angular/core';
import { NavController, Navbar, Events, ModalController, AlertController } from 'ionic-angular';
import { TutorialPage } from '../tutorial/tutorial'

import { UserService } from '../../app/_services/user.service'
import { HomeService } from './_services/home.service'

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(Navbar) navBar: Navbar;

    showTutorialPromise = undefined;
    mostRecentlyCreatedPromises = undefined;

    constructor(public navCtrl: NavController,
                private _modalCtrl: ModalController, 
                private _userService: UserService,
                private _homeService: HomeService
    ) {

    }

    ngOnInit() {
        let self = this;
        self.showTutorialPromise = self._userService.getShowTutorialOnLogin();

        self._homeService.getMostRecentlyCreatedPromises().then((data) => {
            self.mostRecentlyCreatedPromises = data;
        });
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

    getMostRecentlyCreatedPromises() {
        return this.mostRecentlyCreatedPromises;
    }

}
