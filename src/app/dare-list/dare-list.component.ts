import { Component, OnInit } from '@angular/core';
import { KNOWN_DARES_LIST } from './constants';

@Component({
  selector: 'app-dare-list',
  templateUrl: './dare-list.component.html',
  styleUrls: ['./dare-list.component.scss'],
})
export class DareListComponent implements OnInit {

  dareList = KNOWN_DARES_LIST

  constructor() { }

  ngOnInit() {
    
  }

}
