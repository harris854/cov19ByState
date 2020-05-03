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
	private currentGraphTitle:string;

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
		this.currentGraphTitle='USA'
		console.log(this.dateData);
	}

	public onSelected(val) {
		if(val.value !== 'USA'){
			this.dispBucket(val.value);
		}else{
			this.dispBucket();
		}

	}

	public onDateChanged(val) {
		this.changeDataWithTime(val.value);
	}

	dispBucket(states?: string) {
		if (states) {
			console.log(states);
			this.totalDataSet = this.dService.stateDataWithUiData[states];
			this.currentGraphTitle=states;
		} else {
			this.totalDataSet = this.dService.totalDataSet;
			this.currentGraphTitle='USA';
		}
		// build chart using this data
		const graphData = this.dService.prepareLineData(this.totalDataSet, this.selectedDateRange);
		graphData.name = this.currentGraphTitle + '('+graphData.label.length+' days)';
		this.dService.buildBarChart(this.trendyChart, graphData);
	}

	changeDataWithTime(selectedDays?: number) {
		this.selectedDateRange = selectedDays;
		console.log('Days selected ' + selectedDays);
		console.log('Parsed Data ' + this.dService.parsedDataSrc);
		const graphData = this.dService.prepareLineData(this.totalDataSet, selectedDays);
		graphData.name = this.currentGraphTitle + '('+graphData.label.length+' days)';
		this.totalDataSet.totalCases=graphData.totalCases;
		this.totalDataSet.totalDeaths=graphData.totalDeaths;
		this.dService.buildBarChart(this.trendyChart, graphData);
	}
}
