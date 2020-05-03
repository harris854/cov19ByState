import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataServiceService } from '../services/data-service.service';
import * as Chart from 'chart.js';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: [ 'home.page.scss' ]
})
export class HomePage implements OnInit {
	@ViewChild('trendyChart', { static: false })
	trendyChart: ElementRef;
	public stateDataWithUiData: any = {};
	public totalDataSet: any = {};
	public menuData: any;
	public dateData: any;
	public selectedDateRange: number;
	public selectedDropLabel = 'Last 30 days';
	public selectedState = 'USA';

	public sel2Options = {
		placeholder: 'Select state'
	};

	public selectDates = {
		placeholder: 'Select date'
	};

	constructor(private dService: DataServiceService) {}

	async ngOnInit() {
		await this.dService.fetchData();
		this.dispBucket();
		this.menuData = this.dService.menuData;
		this.dateData = this.dService.timeToDisplay;
	}

	ionViewWillEnter(){
		this.selectedState = 'USA';
		this.selectedDropLabel= 'Last 30 days';
	}

	public onSelected(val) {
		this.selectedState = val.value;
		if(this.selectedState = "Select state"){
			this.selectedState = 'USA';
		}
		if(val.value !== 'USA'){
			this.dispBucket(val.value);
		}else{
			this.dispBucket();
		}

	}

	public onDateChanged(val) {
		this.selectedDropLabel = val.data[0].text;
		if(this.selectedDropLabel === 'Select Date'){
			this.selectedDropLabel = 'Last 30 days';
		}
		this.changeDataWithTime(val.value);
	}

	dispBucket(states?: string) {
		if (states) {
			this.totalDataSet = this.dService.stateDataWithUiData[states];
		} else {
			this.totalDataSet = this.dService.totalDataSet;
		}
		// build chart using this data
		const graphData = this.dService.prepareLineData(this.totalDataSet, this.selectedDateRange);
		if (states) {
			graphData.name = states;
		} else {
			graphData.name = 'USA';
		}
		this.dService.buildBarChart(this.trendyChart, graphData);
	}

	changeDataWithTime(selectedDays?: number) {
		this.selectedDateRange = selectedDays;
		this.dService.buildBarChart(this.trendyChart, this.dService.prepareLineData(this.totalDataSet, selectedDays));
	}
}
