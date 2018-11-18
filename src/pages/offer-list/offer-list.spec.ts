import { async, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { mockView, mockNavController } from 'ionic-angular/util/mock-providers';

import { EasyahHeader } from '../../pages/common/easyah-header/easyah-header';
import { OfferListPage } from './offer-list';
import { OfferEditPage } from '../offers/edit.offer';
import { OfferDisplayPage } from '../offers/display.offer';

import { OfferCollectionService } from '../../app/_services/offer-collection.service';
import { UserService } from '../../app/_services/user.service';

import {
  NavParamsMock
} from '../../../test-config/mocks-ionic';

import {
  UserServiceMock,
  OfferCollectionServiceMock
} from '../../../test-config/mocks-easyah';

describe('OfferListPage Component', () => {
  let fixture;
  let component;
  const mockNavCtrl = mockNavController();

  beforeEach(async(() => {
    //NavParamsMock.setParams('keywordArray', []);

    TestBed.configureTestingModule({
      declarations: [OfferListPage, EasyahHeader],
      imports: [
        IonicModule.forRoot(OfferListPage)
      ],
      providers: [
      	{ provide: OfferCollectionService, useClass: OfferCollectionServiceMock },
      	{ provide: UserService, useClass: UserServiceMock },
        { provide: ViewController, useValue: mockView() },
        { provide: NavController, useValue: mockNavCtrl },
        { provide: NavParams, useClass: NavParamsMock }        
      ]
    })
  }));

  beforeEach(() => {

    // TODO: test passing in a set of keywords

    fixture = TestBed.createComponent(OfferListPage);
    fixture.detectChanges();

    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
  });

  it('should be created', () => {
    expect(component instanceof OfferListPage).toBe(true);
  });

  it('should show the OfferEditPage dialog when the New Offer button is tapped', () => {
  	spyOn(mockNavCtrl, 'push');

  	component.onNewOfferBtnTap();

  	expect(mockNavCtrl.push).toHaveBeenCalledWith(OfferEditPage, {offer: undefined, callback: jasmine.any(Function)});
  })

  it('should show the OfferDisplayPage when an individual Offer is tapped', () => {
  	spyOn(mockNavCtrl, 'push');

  	let _offer = {id: -1, text: 'text'};

  	component.onOfferBtnTap(_offer);

  	expect(mockNavCtrl.push).toHaveBeenCalledWith(OfferDisplayPage, {offer: _offer, callback: jasmine.any(Function)});
  })

});
