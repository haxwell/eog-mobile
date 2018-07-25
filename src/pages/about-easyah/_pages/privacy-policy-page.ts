import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-privacy-policy',
    templateUrl: 'privacy-policy-page.html'
})
export class PrivacyPolicyPage {

    constructor(public navCtrl: NavController ) {

    }

    ngOnInit() {

    }

    onGoBackBtnTap(event) {
    	this.navCtrl.pop();
    }

}