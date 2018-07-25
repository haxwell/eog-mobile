import { Component } from '@angular/core';

import { NavController, ModalController } from 'ionic-angular';

import { TutorialPage } from '../../tutorial/tutorial'
import { AcceptRequestTutorialPage } from '../../requests/incoming/_pages/accept.request.tutorial';
import { OutgoingRequestMadeTutorialPage } from '../../promises/_pages/outgoing-request-made-tutorial';

@Component({
    selector: 'page-tutorials-list',
    templateUrl: 'tutorials-list-page.html'
})
export class TutorialsListPage {

    constructor(public navCtrl: NavController,
    			private modalCtrl: ModalController ) {

    }

    ngOnInit() {

    }

    onGoBackBtnTap(event) {
    	this.navCtrl.pop();
    }

    onOutgoingTutorialBtnTap() {
    	let modal = this.modalCtrl.create(OutgoingRequestMadeTutorialPage, { });
    	modal.present();
    }

    onIncomingTutorialBtnTap() {
    	let modal = this.modalCtrl.create(AcceptRequestTutorialPage, { });
    	modal.present();
    }

    onWelcomeTutorialBtnTap() {
    	let modal = this.modalCtrl.create(TutorialPage, { });
    	modal.present();
    }

}