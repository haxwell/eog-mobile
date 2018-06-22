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
import { TutorialPage } from '../pages/tutorial/tutorial';
import { CreateAccountPage } from '../pages/login/_pages/create.account';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileEditPage } from '../pages/profile/profile-edit';
import { ProfileHeader } from '../pages/common/profile-header/profile-header';
import { ChoosePhotoSourcePage } from '../pages/common/choose-photo-source/choose-photo-source';
import { SearchPage } from '../pages/search/search';
import { SocialNetworkCRUDPage } from '../pages/profile/_pages/social-network-CRUD';
import { RequestPage } from '../pages/promises/_pages/request';
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
import { OtherPeoplesPromiseList } from '../pages/common/other-peoples-promise-list/other-peoples-promise-list';
import { PrmEditPage } from '../pages/promises/edit.prm';
import { PrmDisplayPage } from '../pages/promises/display.prm';
import { OutgoingRequestMadeTutorialPage } from '../pages/promises/_pages/outgoing-request-made-tutorial';
import { DeletePrmPage } from '../pages/promises/_pages/delete.prm';
import { RequestsIncomingView } from '../pages/common/requests-incoming/requests-incoming';
import { RequestsOutgoingView } from '../pages/common/requests-outgoing/requests-outgoing';
import { PromiseListPage } from '../pages/promise-list/promise-list';
import { KeywordListPage } from '../pages/keyword-list/keyword-list';
import { RecommendationListPage } from '../pages/recommendation-list/recommendation-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';
import { UsersLineItem } from '../pages/common/users-line-item/users-line-item';
import { RulePage } from '../pages/promises/_pages/rule';
import { KeywordEntryPage } from '../pages/keyword.entry/keyword.entry';
import { ProfilePoints } from '../pages/common/profile-points/profile-points';

import { ApiService } from './_services/api.service';
import { WebsocketService } from './_services/websocket.service';
import { PushMessagingService } from './_services/push.messaging.service';
import { UserService } from './_services/user.service';
import { UserMetadataService } from './_services/user-metadata.service';
import { SearchService } from './_services/search.service';
import { PointsService } from './_services/points.service';
import { FunctionPromiseService } from './_services/function-promise.service';
import { RecommendationService } from './_services/recommendation.service';
import { RequestsService } from './_services/requests.service';
import { RequestMetadataService } from './_services/request-metadata.service';
import { DeclineReasonCodeService } from './_services/declined-reason-codes.service';
import { ProfileService } from '../pages/common/_services/profile.service';
import { PictureService } from './_services/picture.service';
import { PictureEXIFService } from './_services/picture-exif.service';
import { ProfileKeywordService } from './_services/profile-keyword.service';
import { CameraService } from '../pages/common/_services/camera.service';
import { NotificationService } from './_services/notification.service';
import { PrmModelService } from '../pages/promises/_services/prm.model.service';
import { PrmCollectionService } from './_services/prm-collection.service';
import { PrmMetadataService } from './_services/prm-metadata.service';
import { PrmDetailService } from './_services/prm-detail.service';
import { UserPreferencesService } from './_services/user-preferences.service';
import { UnseenChangesIndicatorService } from './_services/unseen-changes-indicator.service';
import { HomeService } from '../pages/home/_services/home.service';

import { Constants } from '../_constants/constants';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class CustomHammerConfig extends HammerGestureConfig {
    overrides = {
        'press': { time: 1000 }  //set press delay for 1 second
    }
}

@NgModule({
  declarations: [
    EasyahApp,
    EasyahHeader,
    LoginPage,
    CreateAccountPage,
    HomePage,
    TutorialPage,
    ProfilePage,
    ProfileEditPage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    PrmEditPage,
    PrmDisplayPage,
    OtherPeoplesPromiseList,
    OutgoingRequestMadeTutorialPage,
    DeletePrmPage,
    RulePage,
    RequestsIncomingView,    
    RequestsOutgoingView,
    PromiseListPage,
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
    CreateAccountPage,
    HomePage,
    TutorialPage,
    ProfilePage,
    ProfileEditPage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    PrmEditPage,
    PrmDisplayPage,
    OtherPeoplesPromiseList,
    OutgoingRequestMadeTutorialPage,
    PromiseListPage,
    KeywordListPage,
    RecommendationListPage,
    NotificationListPage,
    DeletePrmPage,
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
    PrmCollectionService,
    PrmModelService,
    PrmMetadataService,
    PrmDetailService,
    ProfileService,
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
    {provide: HAMMER_GESTURE_CONFIG,    useClass: CustomHammerConfig},
    {provide: ErrorHandler,             useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
