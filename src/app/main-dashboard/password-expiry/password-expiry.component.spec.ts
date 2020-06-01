import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordExpiryComponent } from './password-expiry.component';

describe('PasswordExpiryComponent', () => {
  let component: PasswordExpiryComponent;
  let fixture: ComponentFixture<PasswordExpiryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordExpiryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
