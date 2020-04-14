import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataServiceService } from '../services/data-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public covidTitle = 'BY STATES';
  public stateDataWithUiData: any = {};
  public totalDataSet: any = {};
  public menuData: any;


  public sel2Options = {
    placeholder: 'Select a state'
  };

  constructor(private dService: DataServiceService) {}

  async ngOnInit() {
    await this.dService.fetchData();
    this.dispBucket();
    this.menuData = this.dService.menuData;
  }

  public onSelected(val) {
    this.dispBucket(val.value);
  }

  dispBucket(states?: string) {
    if (states) {
      this.totalDataSet = this.dService.stateDataWithUiData[states];
    } else {
      this.totalDataSet = this.dService.totalDataSet;
    }
  }

}
