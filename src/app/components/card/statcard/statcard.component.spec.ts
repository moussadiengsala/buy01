import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatcardComponent } from './statcard.component';

describe('StatcardComponent', () => {
  let component: StatcardComponent;
  let fixture: ComponentFixture<StatcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
