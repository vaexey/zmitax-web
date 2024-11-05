import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UnexpectedRedirectError } from '../model/UnexpectedRedirectError';
import * as iso88592 from 'iso-8859-2';

@Injectable({
  providedIn: 'root'
})
export class RawZmitacService {

  private proxyUrl = `http://localhost:4200/baza/`

  private loginUrl = "st_login1.php"
  private logoutUrl = "st_logout.php"
  private gradesUrl = "st_main.php"
  private changeSubjectUrl = "st_changesubject.php"
  private setSubjectUrls = /^st_changesubject1.php\?.*$/i

  constructor(
    private http: HttpClient
  ) { }

  private getString(url: string): Observable<string> {
    console.log(`ZMiTAC query: ${this.proxyUrl}${url}`)

    return this.http.get<HttpResponse<any>>(
      `${this.proxyUrl}${url}`,
      {
        observe: "response",
        responseType: "text" as "json"
      }
    ).pipe(
        map(res => {
          // OK
          if(res.status == 200)
          {
            return (res.body ?? "").toString()
          }

          // Redirect
          // if(res.status == 302)
          // {
          //   throw new UnexpectedRedirectError(null, res.headers.get("Location"))
          // }

          // Other
          throw new Error(`Invalid status code ${res.status}`)
        })
      )
  }

  getGrades(): Observable<string> {
    return this.getString(this.gradesUrl)
  }

  getChangeSubject(): Observable<string> {
    return this.getString(this.changeSubjectUrl)
  }

  getLogout(): Observable<string> {
    return this.getString(this.logoutUrl)
  }

  getSetSubject(subjectUrl: string): Observable<string> {
    if(!this.setSubjectUrls.exec(subjectUrl))
      throw new Error("Set subject URL was not in the correct format")

    return this.getString(subjectUrl)
  }

  private encodeIso(string: string): string
  {
    return [...iso88592.encode(string)]
      .map(byte => {
        const char = String.fromCharCode(byte)

        if(/[A-Za-z0-9-_]/.exec(char))
        {
          return char
        }

        return "%" + ("0" + (byte & 0xFF).toString(16)).slice(-2).toUpperCase()
      })
      .join("")
  }

  postLogin(firstname: string, lastname: string, password: string): Observable<string> {
    const body = `imie=${
      this.encodeIso(firstname)
    }&nazwisko=${
      this.encodeIso(lastname)
    }&password=${
      this.encodeIso(password)
    }`

    const headers = new HttpHeaders({
      "Content-type": "application/x-www-form-urlencoded; charset=ISO-8859-1"
    })

    console.log(body)

    // return of("")
    return this.http.post(
      `${this.proxyUrl}${this.loginUrl}`,
      body,
      {
        headers,
        observe: "body",
        responseType: "text" as "json"
      }
    ).pipe(map(data => (data ?? "").toString()))
  }
}
