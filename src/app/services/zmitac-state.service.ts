import { Injectable } from '@angular/core';
import { RawZmitacService } from './raw-zmitac.service';
import { map, Observable } from 'rxjs';
import { LoginState } from '../model/LoginState';
import { Subject } from '../model/Subject';
import { Grades } from '../model/Grades';



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

const gradesTableRegex =
  /<TABLE *CELLPADDING.*?>(.)/s

const gradesRowRegex =
  /<TR>(.*?)<\/TR>/gs

const gradesCellRegex =
  /<(t[hd]) *[^<>]*?=?[^<>]*?>(.*?)<\/t[hd]>/gis

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

  private getArrayFromString(string: string): {tag: string, value: string}[][]
  {
    const tableMatch = gradesTableRegex.exec(string)

    if(!tableMatch)
    {
      throw new Error("No grades table is present")
    }

    const tableIndex = tableMatch.index + tableMatch[0].length - tableMatch[1].length
    const table = string.substring(tableIndex)

    const lines = [...table.matchAll(gradesRowRegex)]

    const rows = lines.map(line => {
      const cells = [...line[1].matchAll(gradesCellRegex)]
        .map(groups => {
          return {
            tag: groups[1].toLowerCase(),
            value: groups[2]
          }
        })

      return cells
    })

    return rows
  }

  private getGradesFromArray(array: {tag: string, value: string}[][]): Grades
  {
    array = [...array]

    // TODO: verify header
    const header = array.splice(0, 1)[0]
    const footer = array.splice(-1)[0]

    if(footer.length !== 4)
    {
      throw new Error("Unsupported grades table footer")
    }

    // TODO: verify footer tag types & number casting
    const grades: Grades = {
      list: [],
      average: +footer[1].value,
      total: +footer[3].value,
    }

    array.forEach(row => {
      if(row.length === 7)
      {
        grades.list.push({
          name: row[0].value,
          terms: [
            +row[1].value, // TODO: extract from <a> tag
            +row[2].value, // TODO: remove if not present
          ],
          average: +row[3].value,
          presence: row[4].value === "obecny",
          report: row[5].value,
          total: +row[6].value,
        })

        return
      }
      
      throw new Error("Unsupported grades table cell count")
    })

    return grades
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

  getGrades(): Observable<Grades>
  {
    return this.rawZmitac.getGrades()
      .pipe(
        map(this.getArrayFromString),
        map(this.getGradesFromArray)
      )
  }

  logout(): Observable<any>
  {
    return this.rawZmitac.getLogout()
      .pipe(map(this.validateLogoutRequest))
  }
}
