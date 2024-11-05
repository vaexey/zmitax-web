import { TestBed } from '@angular/core/testing';

import { ZmitaxService } from './zmitax.service';

describe('ZmitaxService', () => {
  let service: ZmitaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZmitaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
