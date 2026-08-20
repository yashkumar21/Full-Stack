import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudStatsComponent } from './crud-stats.component';

describe('CrudStatsComponent', () => {
  let component: CrudStatsComponent;
  let fixture: ComponentFixture<CrudStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
