import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectFilterDemo  } from './multiselect.component';

describe('MultiselectComponent', () => {
  let component: MultiselectFilterDemo;
  let fixture: ComponentFixture<MultiselectFilterDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectFilterDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiselectFilterDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
