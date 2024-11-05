import { TestBed } from '@angular/core/testing';

import { ZmitacStateService } from './zmitac-state.service';

describe('ZmitacStateService', () => {
  let service: ZmitacStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZmitacStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
