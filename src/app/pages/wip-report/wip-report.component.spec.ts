import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WipReportComponent } from './wip-report.component';

describe('WipReportComponent', () => {
  let component: WipReportComponent;
  let fixture: ComponentFixture<WipReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WipReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WipReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
