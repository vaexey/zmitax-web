import { Component, OnInit } from '@angular/core';
import { LoginState } from '../../model/LoginState';
import { ZmitaxService } from '../../services/zmitax.service';
import { ActivatedRoute, RouterLink } from '@angular/router';


export type NavEntry = NavLinkEntry | NavListEntry

export type NavEntryBase = {
  label: string,
}

export type NavLinkEntry = {
  type: "link",
  href: string,
} & NavEntryBase

export type NavListEntry = {
  label: string,
  type: "list",
  children: NavLinkEntry[],
  hover?: boolean,
} & NavEntryBase

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  navEntries: NavEntry[] = [
    {
      label: "Oceny",
      type: "link",
      href: "/grades",
    },
    {
      label: "Sprawozdanie",
      type: "link",
      href: "/report",
    },
    {
      label: "Przedmioty",
      type: "list",
      children: [
        {
          label: "TÓC",
          type: "link",
          href: "tuc",
        },
        {
          label: "ŚMIW",
          type: "link",
          href: "smiw",
        },
      ]
    },
  ]

  loginState?: LoginState
  routeUrl?: string

  private replaceFrom = "0123456789";
  private replaceTo = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  
  constructor(
    private zmitax: ZmitaxService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(route => {
      this.routeUrl = route.join("/")
      console.log(this.routeUrl)
    })

    this.zmitax.getLoginState().subscribe(loginState => {
      if(loginState.type === "LOGGED")
      {
        this.loginState = {
          ...loginState
        }

        this.loginState.user = this.loginState.user
          ?.split("").map(ch => {
            const iof = this.replaceFrom.indexOf(ch)

            if(iof === -1)
              return ch

            return this.replaceTo[iof]
          }).join("")
      }
    })
  }

}
