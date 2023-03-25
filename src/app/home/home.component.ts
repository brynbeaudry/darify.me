import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  public leaderBoardData : any = {}

  constructor(private http: HttpClient) {

   }

  async ngOnInit() {
    const response = await firstValueFrom(this.http.get<any>('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/leaderboard'))
    this.leaderBoardData = JSON.parse(response.body)
  }

}
