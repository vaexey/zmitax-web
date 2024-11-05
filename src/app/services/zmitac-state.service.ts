import { Injectable } from '@angular/core';
import { RawZmitacService } from './raw-zmitac.service';
import { map, Observable } from 'rxjs';
import { LoginState } from '../model/LoginState';
import { Subject } from '../model/Subject';



const loginRegex = 
  /<.{0,3}H2.*>.{0,3}Logowanie<.{0,3}H2.{0,3}>/
  
const logoutRegex =
  /Wylogowano/

const changeSubjectRegex = 
  /Wybierz przedmiot/

const setSubjectRegex =
  /Wybrany przedmiot: /

const loggedRegex = 
  /Student: (.*)<BR.{0,3}>.{0,3}Przedmiot: (.+) Grupa: (.*)sem: (\d+) (.+) Sekcja: (.*)<.{0,3}P>/

const assertionRegex = 
  /<P.*>Wybierz przedmiot:.{0,3}<BR.{0,3}>/

const subjectRegex = 
  /<A {0,3}HREF="(st_changesubject1.php?.{0,70})" {0,3}>(.{0,30})<.{0,3}\/.{0,3}A.{0,3}>/g


@Injectable({
  providedIn: 'root'
})
export class ZmitacStateService {

  constructor(
    private rawZmitac: RawZmitacService
  ) { }

  private getLoginStateFromString(string: string): LoginState
  {
    if(loginRegex.exec(string))
    {
      return {
        type: "NOT_LOGGED"
      }
    }

    if(changeSubjectRegex.exec(string))
    {
      return {
        type: "SUBJECT_NOT_CHOSEN"
      }
    }

    const loginGroups = loggedRegex.exec(string)
    if(loginGroups && loginGroups.length === 7)
    {
      return {
        type: "LOGGED",
        user: loginGroups[1],
        subject: loginGroups[2],
        // group: loginGroups[3], -- Unused group
        semester: +loginGroups[4],
        major: loginGroups[5],
        group: +loginGroups[6],
      }
    }

    throw new Error("Could not parse login state")
  }

  private getSubjectsFromString(string: string): Subject[]
  {
    if(!assertionRegex.exec(string))
    {
      throw new Error("Could not parse subject list")
    }

    const subjectMatches = [...string.matchAll(subjectRegex)]
    
    if(subjectMatches.length == 0)
    {
      throw new Error("Could not find any subjects in the subjects list")
    }

    return subjectMatches.map(groups => {
      if(groups.length !== 3)
      {
        throw new Error("Invalid subject entry found")
      }

      const url = groups[1]
      const nameAndYear = groups[2]

      if(!nameAndYear.includes(" "))
      {
        throw new Error("Could not parse name and year from subject entry")
      }

      const year = nameAndYear.split(" ").slice(-1)[0]
      const name = nameAndYear.substring(0, nameAndYear.length - year.length - 1)

      return {
        name,
        url,
        year
      }
    })
  }

  // TODO: throw on bad response
  private validateSetSubjectRequest(string: string): void
  {
    if(setSubjectRegex.exec(string))
    {
      return
    }

    throw new Error("Could not detect whether subject change was successful")
  }

  private validateLoginRequest(string: string): boolean
  {
    if(loginRegex.exec(string))
    {
      return false
    }

    if(changeSubjectRegex.exec(string))
    {
      return true
    }

    throw new Error("Could not detect whether login was successful")
  }

  private validateLogoutRequest(string: string): void
  {
    if(logoutRegex.exec(string))
    {
      return
    }

    throw new Error("Could not detect whether logout was successful")
  }

  getLoginState(): Observable<LoginState>
  {
    return this.rawZmitac.getGrades()
      .pipe(map(this.getLoginStateFromString))
  }

  getSubjects(): Observable<Subject[]>
  {
    return this.rawZmitac.getChangeSubject()
      .pipe(map(this.getSubjectsFromString))
  }

  setSubject(subject: Subject): Observable<void>
  {
    return this.rawZmitac.getSetSubject(subject.url)
      .pipe(map(this.validateSetSubjectRequest))
  }

  tryLogin(user: string, password: string): Observable<boolean>
  {
    const firstname = user.split(" ")[0]
    const lastname = user.substring(firstname.length + 1)
    
    return this.rawZmitac.postLogin(
      firstname,
      lastname,
      password
    ).pipe(map(this.validateLoginRequest))
  }

  logout(): Observable<any>
  {
    return this.rawZmitac.getLogout()
      .pipe(map(this.validateLogoutRequest))
  }
}
