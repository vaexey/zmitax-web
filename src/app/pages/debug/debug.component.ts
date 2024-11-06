import { Component, OnInit } from '@angular/core';
import { ZmitacStateService } from '../../services/zmitac-state.service';
import { ZmitaxService } from '../../services/zmitax.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.scss'
})
export class DebugComponent implements OnInit {

  constructor(
    private zmitacState: ZmitacStateService,
    private zmitax: ZmitaxService
  ) {}

  stateString = ""
  subjectString = ""

  ngOnInit(): void {
    // this.zmitacState.getLoginState()
    //   .subscribe(state => {
    //     this.stateString = JSON.stringify(state, null, 4)
    //   })

    // this.zmitacState.getSubjects()
    //   .subscribe(subjects => {
    //     this.subjectString = JSON.stringify(subjects, null, 4)
    //   })
  }

  login()
  {

  }

  logout()
  {
    this.zmitacState.logout().subscribe()
  }
}
