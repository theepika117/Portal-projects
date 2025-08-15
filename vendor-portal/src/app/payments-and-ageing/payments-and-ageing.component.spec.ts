import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsAndAgeingComponent } from './payments-and-ageing.component';

describe('PaymentsAndAgeingComponent', () => {
  let component: PaymentsAndAgeingComponent;
  let fixture: ComponentFixture<PaymentsAndAgeingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsAndAgeingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsAndAgeingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
