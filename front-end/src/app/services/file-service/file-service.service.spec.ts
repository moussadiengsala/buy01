import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileService } from './file-service.service';

describe('FileService', () => {
  let component: FileService;
  let fixture: ComponentFixture<FileService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
