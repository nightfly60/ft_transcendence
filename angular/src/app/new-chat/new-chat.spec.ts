import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChat } from './new-chat';

describe('NewChat', () => {
  let component: NewChat;
  let fixture: ComponentFixture<NewChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChat],
    }).compileComponents();

    fixture = TestBed.createComponent(NewChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
