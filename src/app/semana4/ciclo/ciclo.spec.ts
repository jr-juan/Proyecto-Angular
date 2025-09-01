import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ciclo } from './ciclo';

describe('Ciclo', () => {
  let component: Ciclo;
  let fixture: ComponentFixture<Ciclo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ciclo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ciclo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
