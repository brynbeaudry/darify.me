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

   sortByValueDescending(a: any, b: any) {
    return b.value - a.value;
  }

  async ngOnInit() {
    const response = await firstValueFrom(this.http.get<any>('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/leaderboard'))
    this.leaderBoardData = JSON.parse(response.body)
    console.log(this.leaderBoardData)
  }

}
