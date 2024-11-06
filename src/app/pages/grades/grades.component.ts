import { Component, OnInit } from '@angular/core';
import { ZmitaxService } from '../../services/zmitax.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss'
})
export class GradesComponent implements OnInit {
  
  constructor(
    private zmitax: ZmitaxService
  ) {}

  ngOnInit(): void {
    this.zmitax.getGrades().subscribe((g) => {
      console.log(g)
    })
  }

}
