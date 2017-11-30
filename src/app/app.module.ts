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

import { EasyahApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { CreateAccountPage } from '../pages/login/_pages/create.account';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileHeader } from '../pages/common/profile-header/profile-header';
import { ChoosePhotoSourcePage } from '../pages/common/choose-photo-source/choose-photo-source';
import { SearchPage } from '../pages/search/search';
import { SearchUsersPage } from '../pages/searchUsers/searchUsers';
import { SendPointPage } from '../pages/searchUsers/_pages/send.point.page';
import { SendRecommendPage } from '../pages/searchUsers/_pages/send.recommend.page';
import { RequestPage } from '../pages/promises/_pages/request';
import { AcceptRequestPage } from '../pages/requests/incoming/_pages/accept.request';
import { DeclineRequestPage } from '../pages/requests/incoming/_pages/decline.request';
import { CancelRequestPage } from '../pages/requests/incoming/_pages/cancel.request';
import { CompleteRequestPage } from '../pages/requests/incoming/_pages/complete.request';
import { SecondCompleteRequestPage } from '../pages/requests/incoming/_pages/second.complete.request';
import { CompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/complete.request';
import { NotCompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/not.complete.request';
import { PermanentlyDismissUnresolvedRequestPage } from '../pages/requests/outgoing/_pages/permanently-dismiss-unresolved-request';
import { CancelOutgoingRequestPage } from '../pages/requests/outgoing/_pages/cancel.request';
import { RequestContactInfoPage } from '../pages/requests/_pages/contact.info';
import { PrmPage } from '../pages/promises/promises';
import { DeletePrmPage } from '../pages/promises/_pages/delete.prm';
import { RequestsIncomingView } from '../pages/common/requests-incoming/requests-incoming';
import { RequestsOutgoingView } from '../pages/common/requests-outgoing/requests-outgoing';
import { RequestsLineItem } from '../pages/common/requests-line-item/requests-line-item';
import { RulePage } from '../pages/promises/_pages/rule';
import { KeywordEntryPage } from '../pages/keyword.entry/keyword.entry';

import { ApiService } from './_services/api.service';
import { WebsocketService } from './_services/websocket.service';
import { PushMessagingService } from './_services/push.messaging.service';
import { UserService } from './_services/user.service';
import { UserMetadataService } from './_services/user-metadata.service';
import { SearchService } from './_services/search.service';
import { PointsService } from './_services/points.service';
import { FunctionPromiseService } from './_services/function-promise.service';
import { ProfilePictureService } from './_services/profile-picture.service';
import { RecommendationService } from './_services/recommendation.service';
import { RequestsService } from './_services/requests.service';
import { RequestMetadataService } from './_services/request-metadata.service';
import { DeclineReasonCodeService } from './_services/declined-reason-codes.service';
import { ProfileService } from '../pages/common/_services/profile.service';
import { CameraService } from '../pages/common/_services/camera.service';
import { NotificationService } from '../pages/profile/_services/notification.service';
import { PrmService } from '../pages/promises/_services/prm.service';
import { PrmMetadataService } from './_services/prm-metadata.service';
import { PrmDetailService } from './_services/prm-detail.service';

import { Constants } from '../_constants/constants';

@NgModule({
  declarations: [
    EasyahApp,
    LoginPage,
    CreateAccountPage,
    HomePage,
    TutorialPage,
    ProfilePage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    PrmPage,
    DeletePrmPage,
    RulePage,
    RequestsIncomingView,    
    RequestsOutgoingView,
    RequestsLineItem,
    RequestPage,
    AcceptRequestPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    SecondCompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    PermanentlyDismissUnresolvedRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage,
    SearchUsersPage,
    SendPointPage,
    SendRecommendPage,

    KeywordEntryPage
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
    LoginPage,
    CreateAccountPage,
    HomePage,
    TutorialPage,
    ProfilePage,
    ProfileHeader,
    ChoosePhotoSourcePage,
    PrmPage,
    DeletePrmPage,
    RulePage,
    RequestsIncomingView,
    RequestsOutgoingView,
    RequestPage,
    AcceptRequestPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    SecondCompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    PermanentlyDismissUnresolvedRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage,
    SearchUsersPage,
    SendPointPage,
    SendRecommendPage,

    KeywordEntryPage
  ],
  providers: [
    Constants,
    StatusBar,
    SplashScreen,
    Push, 
    Camera,
    File,
    FileTransfer,
    ApiService,
    UserService,
    UserMetadataService,
    PointsService,
    FunctionPromiseService,
    ProfilePictureService,
    SearchService,
    PrmService,
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
