import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { LocalStorageModule } from 'angular-2-local-storage';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Push } from '@ionic-native/push';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer'
import { File } from '@ionic-native/file'
import { FilePath } from '@ionic-native/file-path'

import { EasyahApp } from './app.component';
import { EasyahHeader } from '../pages/common/easyah-header/easyah-header';
import { LoginPage } from '../pages/login/login';
import { AboutEasyahPage } from '../pages/about-easyah/about-easyah';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { TutorialsListPage } from '../pages/about-easyah/_pages/tutorials-list-page';
import { PrivacyPolicyPage } from '../pages/about-easyah/_pages/privacy-policy-page';
import { NewAccountTutorialPage } from '../pages/login/_pages/new-account-tutorial-page';
import { CreateAccountPage } from '../pages/login/_pages/create.account';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileEditPage } from '../pages/profile/profile-edit';
import { ProfileHeader } from '../pages/common/profile-header/profile-header';
import { ChoosePhotoSourcePage } from '../pages/common/choose-photo-source/choose-photo-source';
import { SearchPage } from '../pages/search/search';
import { SocialNetworkCRUDPage } from '../pages/profile/_pages/social-network-CRUD';
import { RequestPage } from '../pages/offers/_pages/request';
import { AcceptRequestPage } from '../pages/requests/incoming/_pages/accept.request';
import { AcceptRequestTutorialPage } from '../pages/requests/incoming/_pages/accept.request.tutorial';
import { DeclineRequestPage } from '../pages/requests/incoming/_pages/decline.request';
import { CancelRequestPage } from '../pages/requests/incoming/_pages/cancel.request';
import { CompleteRequestPage } from '../pages/requests/incoming/_pages/complete.request';
import { CompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/complete.request';
import { NotCompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/not.complete.request';
import { PermanentlyDismissUnresolvedRequestPage } from '../pages/requests/outgoing/_pages/permanently-dismiss-unresolved-request';
import { CancelOutgoingRequestPage } from '../pages/requests/outgoing/_pages/cancel.request';
import { RequestContactInfoPage } from '../pages/requests/_pages/contact.info';
import { OtherPeoplesOfferList } from '../pages/common/other-peoples-offer-list/other-peoples-offer-list';
import { OfferEditPage } from '../pages/offers/edit.offer';
import { OfferDisplayPage } from '../pages/offers/display.offer';
import { OutgoingRequestMadeTutorialPage } from '../pages/offers/_pages/outgoing-request-made-tutorial';
import { DeleteOfferPage } from '../pages/offers/_pages/delete.offer';
import { RequestsIncomingView } from '../pages/common/requests-incoming/requests-incoming';
import { RequestsOutgoingView } from '../pages/common/requests-outgoing/requests-outgoing';
import { OfferListPage } from '../pages/offer-list/offer-list';
import { KeywordListPage } from '../pages/keyword-list/keyword-list';
import { RecommendationListPage } from '../pages/recommendation-list/recommendation-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';
import { UsersLineItem } from '../pages/common/users-line-item/users-line-item';
import { RulePage } from '../pages/offers/_pages/rule';
import { KeywordEntryPage } from '../pages/keyword.entry/keyword.entry';
import { ProfilePoints } from '../pages/common/profile-points/profile-points';

import { ApiService } from './_services/api.service';
import { WebsocketService } from './_services/websocket.service';
import { PushMessagingService } from './_services/push.messaging.service';
import { UserService } from './_services/user.service';
import { UserMetadataService } from './_services/user-metadata.service';
import { SearchService } from './_services/search.service';
import { PointsService } from './_services/points.service';
import { EventSubscriberService } from './_services/event-subscriber.service';
import { FunctionPromiseService } from './_services/function-promise.service';
import { RecommendationService } from './_services/recommendation.service';
import { RequestsService } from './_services/requests.service';
import { RequestMetadataService } from './_services/request-metadata.service';
import { DeclineReasonCodeService } from './_services/declined-reason-codes.service';
import { ProfileService } from '../pages/common/_services/profile.service';
import { ContactInfoVisibilityService } from '../pages/profile/_services/contact-info-visibility.service';
import { PictureService } from './_services/picture.service';
import { PictureEXIFService } from './_services/picture-exif.service';
import { ProfileKeywordService } from './_services/profile-keyword.service';
import { CameraService } from '../pages/common/_services/camera.service';
import { NotificationService } from './_services/notification.service';
import { OfferModelService } from './_services/offer-model.service';
import { OfferCollectionService } from './_services/offer-collection.service';
import { OfferMetadataService } from './_services/offer-metadata.service';
import { OfferDetailService } from './_services/offer-detail.service';
import { UserPreferencesService } from './_services/user-preferences.service';
import { UnseenChangesIndicatorService } from './_services/unseen-changes-indicator.service';
import { HomeService } from '../pages/home/_services/home.service';

import { Constants } from '../_constants/constants';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class CustomHammerConfig extends HammerGestureConfig {
    overrides = {
        'press': { time: 700 }  //set press delay for .70 seconds
    }
}

@NgModule({
  declarations: [
    EasyahApp,
    EasyahHeader,
    LoginPage,
    AboutEasyahPage,
    CreateAccountPage,
    HomePage,
    TutorialPage,
    TutorialsListPage,
    PrivacyPolicyPage,
    NewAccountTutorialPage,
    ProfilePage,
    ProfileEditPage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    OfferEditPage,
    OfferDisplayPage,
    OtherPeoplesOfferList,
    OutgoingRequestMadeTutorialPage,
    DeleteOfferPage,
    RulePage,
    RequestsIncomingView,    
    RequestsOutgoingView,
    OfferListPage,
    KeywordListPage,
    RecommendationListPage,
    NotificationListPage,
    UsersLineItem,
    SocialNetworkCRUDPage,
    RequestPage,
    AcceptRequestPage,
    AcceptRequestTutorialPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    PermanentlyDismissUnresolvedRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage,
    KeywordEntryPage,
    ProfilePoints
  ],
  imports: [
    BrowserModule,
    HttpModule,
    LocalStorageModule.withConfig({
        prefix: 'easyah-app',
        storageType: 'localStorage'
    }),
    IonicModule.forRoot(EasyahApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    EasyahApp,
    EasyahHeader,
    LoginPage,
    AboutEasyahPage,
    CreateAccountPage,
    HomePage,
    TutorialPage,
    TutorialsListPage,
    PrivacyPolicyPage,
    NewAccountTutorialPage,
    ProfilePage,
    ProfileEditPage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    OfferEditPage,
    OfferDisplayPage,
    OtherPeoplesOfferList,
    OutgoingRequestMadeTutorialPage,
    OfferListPage,
    KeywordListPage,
    RecommendationListPage,
    NotificationListPage,
    DeleteOfferPage,
    RulePage,
    RequestsIncomingView,
    RequestsOutgoingView,
    SocialNetworkCRUDPage,
    RequestPage,
    AcceptRequestPage,
    AcceptRequestTutorialPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    PermanentlyDismissUnresolvedRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage,
    KeywordEntryPage,
    ProfilePoints
  ],
  providers: [
    Constants,
    StatusBar,
    SplashScreen,
    Push, 
    Camera,
    File,
    FilePath,
    FileTransfer,
    ApiService,
    UserService,
    UserMetadataService,
    UserPreferencesService,
    PointsService,
    FunctionPromiseService,
    ProfileKeywordService,
    PictureService,
    PictureEXIFService,
    SearchService,
    OfferCollectionService,
    OfferModelService,
    OfferMetadataService,
    OfferDetailService,
    ProfileService,
    ContactInfoVisibilityService,
    CameraService,
    RequestsService,
    RequestMetadataService,
    DeclineReasonCodeService,    
    RecommendationService,
    NotificationService,
    WebsocketService,
    PushMessagingService,
    UnseenChangesIndicatorService,
    HomeService,
    EventSubscriberService,
    {provide: HAMMER_GESTURE_CONFIG,    useClass: CustomHammerConfig},
    {provide: ErrorHandler,             useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
