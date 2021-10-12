import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lat-long',
  templateUrl: './lat-long.component.html',
  styleUrls: ['./lat-long.component.scss'],
})
export class LatLongComponent implements OnInit {

  private latitude: number;
  private longitude: number;

  constructor() {

  }

  ngOnInit() {
    this.latitude = 45.045968;
    this.longitude = -77.023843;
  }

  ngOnDestroy() {
   
  }

}