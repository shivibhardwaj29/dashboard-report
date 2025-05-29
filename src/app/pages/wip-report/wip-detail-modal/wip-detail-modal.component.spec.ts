import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WipDetailModalComponent } from './wip-detail-modal.component';

describe('WipDetailModalComponent', () => {
  let component: WipDetailModalComponent;
  let fixture: ComponentFixture<WipDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WipDetailModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WipDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
