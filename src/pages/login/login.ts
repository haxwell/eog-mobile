import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../home/home';
import { CreateAccountPage } from './_pages/create.account'

import { UserService } from '../../app/_services/user.service';
import { GeolocationService } from '../../app/_services/geolocation.service';

import { environment } from '../../_environments/environment';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  user = {id:-1, name: '', password: ''};
  loading = undefined;
  codeAlreadySent = false;
  
  constructor(public navCtrl: NavController,
              private _alertCtrl: AlertController,
              private _userService: UserService,
              private _geolocationService: GeolocationService,
              private loadingCtrl: LoadingController,
              private splashScreen: SplashScreen,
              private _events: Events) {

              if ( !environment.production )
                this.user = {id:-1, name: 'eoguser2', password: 'password'};
  }

  ionViewWillEnter() {
      this.splashScreen.hide();
  }

  onLoginBtnTap(event) {

    if (this.user.name.length > 0 && this.user.password.length > 0) {
      let self = this;
      self.loading = self.loadingCtrl.create({
        content: 'Please wait...'
      })

      self.loading.present();

      this._userService.verifyAndLoginUser(this.user.name, this.user.password).then((userObj) => {
        let pw = self.user.password;
        let un = self.user.name;

        self.user = userObj;
        
        self.user["password"] = pw;
        self.user["name"] = un;

        self._events.publish("app:login", userObj);

        self.loading.dismiss();
        
        self.ensureLatitudeLongitudeIsSetForCurrentUser().then(() => {
            self.navCtrl.push(HomePage);        
        })
      })
      .catch((err) => {
          self.loading.dismiss();
          let okAlert = self._alertCtrl.create({
                  title: 'Sad face..',
                  subTitle: "Bad username/password!",
                  buttons: [{
                    text: 'OK',
                    handler: () => { }
                  }]
                })

          okAlert.present();
      });
    }
  }

  onCreateAccountBtnTap(event) {
    this.navCtrl.push(CreateAccountPage);
  }

  onLostPasswordClick(event) {
    let self = this;
    let okAlert = self._alertCtrl.create({
            title: '',
            subTitle: "Would you like to reset your password?",
            buttons: [{
              text: "Oops, no..",
              role: 'cancel'
            }, {
              text: 'Yes!',
              handler: () => {
                this.onResetPasswordClick();
              }
            }]
          })

    okAlert.present();
  }

  onResetPasswordClick() {
    let self = this;
        let alert = self._alertCtrl.create({
        title: "Enter your phone number. We'll send you a code.",
        inputs: [{
          name: 'phoneNumber',
          placeholder: '..10 digit phone number..',
          type: 'number'
        }],
        buttons: [{
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Send Code',
          handler: (data) => {

            if (data.phoneNumber.length != 10)
              return false;

            self._userService.isPhoneNumberAvailable(data.phoneNumber).then((isAvailable) => {
              if (isAvailable) {
                let okAlert = self._alertCtrl.create({
                        title: 'Uh oh!',
                        subTitle: "We don't have an account with that phone number. :(",
                        buttons: [{
                          text: "OK",
                          role: 'cancel'
                        }]
                      })

                okAlert.present();
              } else {
                self._userService.sendCodeToPhoneNumber(data.phoneNumber);
                self.codeAlreadySent = true;

                this.onCodeSentToPhoneNumber(data.phoneNumber);
              }
            });
          }
        }]
      })

      alert.present();
  }

  onCodeSentToPhoneNumber(phoneNumber) {
    let self = this;
      let alert = self._alertCtrl.create({
        title: "What's in the text?",
        inputs: [{
          name: 'code',
          placeholder: '..code from text msg..',
          type: 'number'
        }],
        buttons: [{
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Got it!',
          handler: (data) => {
              if (data.code !== undefined && data.code.length > 0) {
                self.loading = self.loadingCtrl.create({
                  content: 'Please wait...'
                });

                self.loading.present();

                self._userService.isAValidSMSChallengeCode(phoneNumber, data.code).then((b) => {
                  if (b) {

                      // present dialog allowing user to enter new password

                      let pwAlert = self._alertCtrl.create({
                        title: "Enter Your New Password",
                        inputs: [{
                          name: 'pw1',
                          placeholder: '..new password..'
                        }, {
                          name: 'pw2',
                          placeholder: '..verify password..'
                        }],
                        buttons: [{
                          text: 'Cancel',
                          role: 'cancel'
                        }, {
                          text: 'OK',
                          handler: (data2) => {
                            if (data2.pw1 && data2.pw1.length > 5 && data2.pw1 == data2.pw2) {
                              self._userService.changeLostPassword(data.code, phoneNumber, data2.pw2).then((response) => {

                                  if (response["id"]) {
                                    let done = self._alertCtrl.create({
                                      title: 'Yay!',
                                      message: "Your password has been changed.<br/><br/>Username: " + response["name"],
                                      buttons: [{
                                        text: 'OK',
                                        handler: () => {
                                          self.loading.dismiss();
                                        }
                                      }]
                                    })
                                    
                                    done.present();
                                  } else {
                                    let done = self._alertCtrl.create({
                                      title: 'Hmmm...!',
                                      message: "Could not change your password... Try again.",
                                      buttons: [{
                                        text: 'OK',
                                        handler: () => {
                                          self.loading.dismiss();
                                        }
                                      }]
                                    })
                                    
                                    done.present();
                                  }

                                }, (err) => {
                                  
                                  let errr = self._alertCtrl.create({
                                    title: 'Arggh!',
                                    message: "Something bad happened on the server. We hate when that happens. Please email us at info@easyah.io and let us know.",
                                    buttons: [{
                                      text: 'OK',
                                      handler: () => {
                                        self.loading.dismiss();
                                      }
                                    }]
                                  })
                                  
                                  errr.present();
                                })
                            } else {
                              return false;
                            }
                          }
                        }]
                    });

                    pwAlert.present();

                  } else {
                    let err = self._alertCtrl.create({
                      title: 'Aargh...',
                      message: "That wasn't a valid code.......",
                      buttons: [{
                        text: 'Grr.',
                        handler: () => {
                          self.loading.dismiss();
                        }
                      }]
                    })
                    
                    err.present();
                  }
                })
              }
          }
        }]
      });
      
      alert.present();
  }

  ensureLatitudeLongitudeIsSetForCurrentUser() {

    return new Promise((resolve, reject) => {
        let self = this;
        if ((!self.user["latitude"] || self.user["latitude"]*1.0 === 0.0) && 
            (!self.user["longitude"] || self.user["longitude"]*1.0 === 0.0)) {

            let locAlert = self._alertCtrl.create({
              title: 'FYI...',
              message: "Easyah does not have a location set for you. We use your location to show you things that are local for you. We will try to set the location now.",
              buttons: [{
                text: 'OK',
                handler: () => {

                    //    
                    // TODO: Very similar code in profile-edit.. Refactor it to a service with callbacks and all that good stuff.
                    //

                    let self = this;

                    self._geolocationService.getCurrentPosition().then((resp) => {
                        self.user["latitude"] = resp["coords"].latitude;
                        self.user["longitude"] = resp["coords"].longitude;

                        self._userService.save(self.user).then((obj) => {
                            let alert = self._alertCtrl.create({
                              title: 'Success',
                              message: "Your location has been updated!",
                              buttons: [{
                                text: 'OK',
                                handler: () => {
                                  resolve();
                                }
                              }]
                            })
                            
                            alert.present();

                        }, (err) => {
                            let errr = self._alertCtrl.create({
                              title: 'Arggh!',
                              message: "Something bad happened on the server. We hate when that happens. Please email us at info@easyah.io and let us know.",
                              buttons: [{
                                text: 'OK',
                                handler: () => {
                                  reject();
                                }
                              }]
                            })
                            
                            errr.present();
                        })
                    }, (error) => {

                      let alert = self._alertCtrl.create({
                          title: 'Hmmm..',
                          message: "Easyah could not read your device's location. Where are you?",
                          inputs: [{
                              name: 'city',
                              placeholder: 'city',
                              type: 'text'
                          }, {
                              name: 'state',
                              placeholder: 'state',
                              type: 'text'
                          }],
                          buttons: [{
                              text: 'Here I am!',
                              handler: (data) => {
                                if ((data.city && data.city.length >= 3) && (data.state && data.state.length >= 2)) {

                                    self._geolocationService.getLatlongFromCityState(data.city, data.state).then((obj) => {
                                        
                                        self.user["latitude"] = obj["latitude"];
                                        self.user["longitude"] = obj["longitude"];

                                        self._userService.save(self.user).then((obj) => {
                                            let alert = self._alertCtrl.create({
                                              title: 'Success',
                                              message: "Your location has been updated!",
                                              buttons: [
                                                {
                                                    text: 'OK', role: 'cancel', handler: () => {
                                                      resolve();
                                                    }
                                                }
                                              ]
                                            })

                                            alert.present();
                                        }, (err) => {
                                            let errr = self._alertCtrl.create({
                                              title: 'Arggh!',
                                              message: "Something bad happened on the server. We hate when that happens. Please email us at info@easyah.io and let us know.",                                      
                                              buttons: [{
                                                text: 'OK',
                                                handler: () => {
                                                    reject();
                                                }
                                              }]
                                            })
                                            
                                            errr.present();
                                        })
                                    }, (err) => {
                                        let errr = self._alertCtrl.create({
                                          title: 'Arggh!',
                                          message: "Sorry, we couldn't find that location either. You can set your location in your profile later on.",
                                          buttons: [{
                                            text: 'OK',
                                            handler: () => {
                                                reject();
                                            }
                                          }]
                                        })
                                        
                                        errr.present();
                                    })
                                } else {
                                  return false; // disble the button
                                }
                              } // end handler
                            }] // end buttons
                          }); // end alert 

                          alert.present();
                      }); // end catch error
                }
              }]
            })
            
            locAlert.present();

          } else {
            resolve();
          } // end if latlng
        
        }); // end promise
    }

}
