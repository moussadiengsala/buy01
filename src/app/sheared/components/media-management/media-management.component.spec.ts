import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaManagementComponent } from './media-management.component';

describe('MediaManagementComponent', () => {
  let component: MediaManagementComponent;
  let fixture: ComponentFixture<MediaManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
