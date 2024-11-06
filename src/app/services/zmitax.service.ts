import { Injectable } from '@angular/core';
import { ZmitacStateService } from './zmitac-state.service';
import { LoginState } from '../model/LoginState';
import { Subject } from '../model/Subject';
import { concatMap, map, Observable, of } from 'rxjs';
import { Grades } from '../model/Grades';

@Injectable({
  providedIn: 'root'
})
export class ZmitaxService {

  private loginState?: LoginState
  private subjects?: Subject[]

  constructor(
    private zmitac: ZmitacStateService
  ) { }

  // TODO: proper caching
  getLoginState(): Observable<LoginState>
  {
    if(this.loginState)
    {
      return of(this.loginState)
    }

    return this.zmitac.getLoginState()
      .pipe(map(data => {
        this.loginState = data

        return data
      }))
  }

  isLogged(): Observable<boolean>
  {
    return this.getLoginState()
      .pipe(map(state => state.type === 'LOGGED'))
  }

  // TODO: proper caching
  getSubjects(): Observable<Subject[]>
  {
    if(this.subjects)
    {
      return of(this.subjects)
    }

    return this.zmitac.getSubjects()
      .pipe(map(data => {
        this.subjects = data

        return data
      }))
  }

  // TODO: caching
  getGrades(): Observable<Grades>
  {
    return this.zmitac.getGrades()
  }

  clear(): void
  {
    this.loginState = undefined
    this.subjects = undefined
  }

  login(user: string, password: string): Observable<boolean>
  {
    this.clear()

    return this.zmitac.tryLogin(
      user,
      password
    ).pipe(
      concatMap(validLogin => {
        if(!validLogin)
          return of(null)

        return this.getSubjects()
      }),
      concatMap(subjects => {
        if(subjects === null)
          return of(null)

        return this.zmitac.setSubject(subjects[0])
          .pipe(map(() => true))
      }),
      concatMap(validLogin => {
        if(validLogin === null)
          return of(false)

        return this.isLogged()
      })
    )
  }
}
