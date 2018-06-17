import { async, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { mockView, mockNavController } from 'ionic-angular/util/mock-providers';

import { EasyahHeader } from '../../pages/common/easyah-header/easyah-header';
import { PromiseListPage } from './promise-list';
import { PrmEditPage } from '../promises/edit.prm';
import { PrmDisplayPage } from '../promises/display.prm';

import { PrmCollectionService } from '../../app/_services/prm-collection.service';
import { UserService } from '../../app/_services/user.service';

import {
  NavParamsMock
} from '../../../test-config/mocks-ionic';

import {
  UserServiceMock,
  PrmCollectionServiceMock
} from '../../../test-config/mocks-easyah';

describe('PromiseListPage Component', () => {
  let fixture;
  let component;
  const mockNavCtrl = mockNavController();

  beforeEach(async(() => {
    //NavParamsMock.setParams('keywordArray', []);

    TestBed.configureTestingModule({
      declarations: [PromiseListPage, EasyahHeader],
      imports: [
        IonicModule.forRoot(PromiseListPage)
      ],
      providers: [
      	{ provide: PrmCollectionService, useClass: PrmCollectionServiceMock },
      	{ provide: UserService, useClass: UserServiceMock },
        { provide: ViewController, useValue: mockView() },
        { provide: NavController, useValue: mockNavCtrl },
        { provide: NavParams, useClass: NavParamsMock }        
      ]
    })
  }));

  beforeEach(() => {

    // TODO: test passing in a set of keywords

    fixture = TestBed.createComponent(PromiseListPage);
    fixture.detectChanges();

    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
  });

  it('should be created', () => {
    expect(component instanceof PromiseListPage).toBe(true);
  });

  it('should show the PrmEditPage dialog when the New Promise button is tapped', () => {
  	spyOn(mockNavCtrl, 'push');

  	component.onNewPromiseBtnTap();

  	expect(mockNavCtrl.push).toHaveBeenCalledWith(PrmEditPage, {prm: undefined, callback: jasmine.any(Function)});
  })

  it('should show the PrmDisplayPage when an individual Promise is tapped', () => {
  	spyOn(mockNavCtrl, 'push');

  	let _prm = {id: -1, text: 'text'};

  	component.onPromiseBtnTap(_prm);

  	expect(mockNavCtrl.push).toHaveBeenCalledWith(PrmDisplayPage, {prm: _prm, callback: jasmine.any(Function)});
  })

});
