import { async, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { ViewController, NavParams } from 'ionic-angular';
import { mockView } from 'ionic-angular/util/mock-providers';


import { KeywordEntryPage } from './keyword.entry';
import {
  NavParamsMock
} from '../../../test-config/mocks-ionic';

describe('KeywordEntryPage Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    NavParamsMock.setParams('keywordArray', []);

    TestBed.configureTestingModule({
      declarations: [KeywordEntryPage],
      imports: [
        IonicModule.forRoot(KeywordEntryPage)
      ],
      providers: [
        { provide: ViewController, useValue: mockView() },
        { provide: NavParams, useClass: NavParamsMock }        
      ]
    })
  }));

  beforeEach(() => {

    // TODO: test passing in a set of keywords

    fixture = TestBed.createComponent(KeywordEntryPage);
    fixture.detectChanges();

    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
  });

  it('should be created', () => {
    expect(component instanceof KeywordEntryPage).toBe(true);
  });

  it('should not have save button enabled', () => {
    expect(component.getKeywordArray().length).toEqual(0);
    expect(component.isSaveBtnEnabled()).toBe(false);
  });


  it('should not have add button enabled', () => {
    expect(component.getKeywordArray().length).toEqual(0);
    expect(component.getAddKeywordFieldValue()).toBe('');
    expect(component.isAddBtnEnabled()).toBe(false);
  });

  it('should enable the add button when theres yet to be submitted text', () => {
    component.newKeywordsString = 'testing,1,2,3';

    expect(component.getKeywordArray().length).toEqual(0);
    expect(component.getAddKeywordFieldValue()).toBe('testing,1,2,3');

    expect(component.isAddBtnEnabled()).toBe(true);
  });

  it('should add newly typed keywords as only keywords when keywords is empty, as in an initial state', () => {
    component.newKeywordsString = 'testing,1,2,3';

    expect(component.getKeywordArray().length).toEqual(0);
    expect(component.getAddKeywordFieldValue()).toBe('testing,1,2,3');

    component.onAddBtnTap();

    expect(component.getKeywordArray()).toContain({id: -1, text: '2'});
    expect(component.getKeywordArray()).toContain({id: -1, text: 'testing'});
    expect(component.getKeywordArray().length).toEqual(4);
    expect(component.getAddKeywordFieldValue()).toBe('');
    expect(component.isAddBtnEnabled()).toBe(false);
  });

  it('should add newly typed keywords as only keywords when keywords is empty, as in an initial state', () => {
    component.getKeywordArray().push({id: -1, text: 'foo'});
    component.newKeywordsString = 'testing,1,2,3';

    expect(component.getKeywordArray().length).toEqual(1);
    expect(component.getAddKeywordFieldValue()).toBe('testing,1,2,3');

    component.onAddBtnTap();

    expect(component.getKeywordArray()).toContain({id: -1, text: '2'});
    expect(component.getKeywordArray()).toContain({id: -1, text: 'testing'});
    expect(component.getKeywordArray()).toContain({id: -1, text: 'foo'});    
    expect(component.getKeywordArray().length).toEqual(5);
    expect(component.getAddKeywordFieldValue()).toBe('');
    expect(component.isAddBtnEnabled()).toBe(false);
  });

  it('should not have keywords already', () => {
    expect(component.userHasNoKeywords()).toBe(true);
  });

  it('should break down a single-value string delimited by periods correctly', () => {
    component.newKeywordsString = "testing1.2.3";
    expect(component.getAddKeywordFieldValue()).toBe('testing1.2.3');

    component.onAddBtnTap();

    expect(component.getKeywordArray()).toContain({id: -1, text: 'testing1.2.3'});
    expect(component.getKeywordArray().length).toEqual(1);
  });

  it('should break down a single-value string delimited by spaces correctly', () => {
    component.newKeywordsString = "testing1 2 3";
    expect(component.getAddKeywordFieldValue()).toBe('testing1 2 3');

    component.onAddBtnTap();

    expect(component.getKeywordArray()).toContain({id: -1, text: 'testing1 2 3'});
    expect(component.getKeywordArray().length).toEqual(1);
  });

});
