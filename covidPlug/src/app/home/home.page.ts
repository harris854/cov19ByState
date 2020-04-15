import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataServiceService } from '../services/data-service.service';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('trendyChart', {static: false }) trendyChart: ElementRef;
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
    // build chart using this data
    const graphData = this.dService.prepareLineData(this.totalDataSet);
    if (states) {
      graphData.name = states;
    } else {
      graphData.name = 'USA';
    }
    this.dService.buildBarChart(this.trendyChart, graphData);
  }

}
