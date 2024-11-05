import { TestBed } from '@angular/core/testing';

import { RawZmitacService } from './raw-zmitac.service';

describe('RawZmitacService', () => {
  let service: RawZmitacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RawZmitacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
