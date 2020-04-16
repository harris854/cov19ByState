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

	public sel2Options = {
		placeholder: 'Total - Select any state.'
	};

	public selectDates = {
		placeholder: 'Select date range'
	};

	constructor(private dService: DataServiceService) {}

	async ngOnInit() {
		await this.dService.fetchData();
		this.dispBucket();
		this.menuData = this.dService.menuData;
		this.dateData = this.dService.timeToDisplay;

		console.log(this.dateData);
	}

	public onSelected(val) {
		this.dispBucket(val.value);
	}

	public onDateChanged(val) {
		this.changeDataWithTime(val.value);
	}

	dispBucket(states?: string) {
		if (states) {
			console.log(states);
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
		console.log('Days selected ' + selectedDays);
		console.log('Parsed Data ' + this.dService.parsedDataSrc);

		this.dService.buildBarChart(this.trendyChart, this.dService.prepareLineData(this.totalDataSet, selectedDays));
	}
}
