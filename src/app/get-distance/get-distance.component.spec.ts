import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDistanceComponent } from './get-distance.component';

describe('GetDistanceComponent', () => {
  let component: GetDistanceComponent;
  let fixture: ComponentFixture<GetDistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetDistanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
