import { Component } from '@angular/core';

import { NavController, ModalController } from 'ionic-angular';

import { PrivacyPolicyPage } from './_pages/privacy-policy-page'
import { TutorialsListPage } from './_pages/tutorials-list-page'

@Component({
    selector: 'page-about-easyah',
    templateUrl: 'about-easyah.html'
})
export class AboutEasyahPage {

    constructor(private navCtrl: NavController  ) {

    }

    ngOnInit() {

    }

    onPrivacyPolicyBtnTap() {
    	this.navCtrl.push(PrivacyPolicyPage, { });
    }

    onTutorialsBtnTap() { 
    	this.navCtrl.push(TutorialsListPage, { });
    }
}