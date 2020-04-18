import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Chart from 'chart.js';
@Injectable({
	providedIn: 'root'
})
export class DataServiceService {
	public dataSrc: any = {};
	public parsedDataSrc: any = {};
	public stateDataWithUiData: any = {};
	public totalDataSet: any = {
		totalCases: 0,
		totalDeaths: 0,
		allTimeData: []
	};

	public menuData: any = [];
	public barChart: any = {};

	public timeToDisplay: any = [
		{ id: '', text: 'Select date range' },
		{ id: 3, text: 'Last 3 Days' },
		{ id: 7, text: 'Last Week' },
		{ id: 15, text: 'Last 15 Days' },
		{ id: 30, text: 'Last 30 Days' }
	];

	public defaultTimeToDisplay: number = 30;

	constructor() {}

	public fetchData() {
		return new Promise((resolve, reject) => {
			Papa.parse('http://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv', {
				download: true,
				complete: (results) => {
					this.dataSrc = results.data;
					this.parseData();
					this.populateTotalValues();
					resolve(true);
				}
			});
		});
	}

	private parseData() {
		_.each(this.dataSrc, (val, ind) => {
			if (ind !== 0) {
				if (this.parsedDataSrc[val[1]]) {
					this.parsedDataSrc[val[1]].push(this.craftObj(val));
				} else {
					this.parsedDataSrc[val[1]] = [ this.craftObj(val) ];
				}
			}
		});
	}

	private populateTotalValues() {
		_.map(this.parsedDataSrc, (data, key) => {
			const revArr = data.reverse();
			this.totalDataSet.date = revArr[0].date.format('YYYY-MM-DD');
			this.stateDataWithUiData[key] = {
				totalCases: revArr[0].case,
				totalDeaths: revArr[0].death,
				allTimeData: _.slice(revArr),
				date: revArr[0].date.format('YYYY-MM-DD')
			};
			this.totalDataSet.totalCases += revArr[0].case;
			this.totalDataSet.totalDeaths += revArr[0].death;

			_.each(this.stateDataWithUiData[key].allTimeData, (val, ind) => {
				if (this.totalDataSet.allTimeData[ind]) {
					this.totalDataSet.allTimeData[ind].case += val.case;
					this.totalDataSet.allTimeData[ind].death += val.death;
				} else {
					this.totalDataSet.allTimeData[ind] = {
						date: val.date,
						case: val.case,
						death: val.death
					};
				}
			});
			this.menuData.push({
				id: key,
				text: key
			});
		});
		this.menuData = _.orderBy(this.menuData, 'id');
		this.menuData.unshift({id: 'USA', text: 'USA'});
		this.menuData.unshift({ id: '', text: 'Select a States' });
		this.timeToDisplay.push({
			id: this.menuData.length,
			text: 'All time data (' + this.menuData.length + ' days)'
		});
	}

	private craftObj(obj): any {
		const retObj: any = {
			date: moment(obj[0]),
			fips: obj[2],
			case: +obj[3],
			death: +obj[4]
		};
		return retObj;
	}

	public prepareLineData(data, noOfDays) {
		if (noOfDays < this.defaultTimeToDisplay) {
			noOfDays = this.defaultTimeToDisplay;
		}
		const retObj: any = {
			label: [],
			dataCase: [],
			dataDeath: []
		};
		_.each(_.slice(data.allTimeData, 0, noOfDays).reverse(), (val) => {
			console.log(val);
			retObj.label.push(val.date.format('MM-DD'));
			retObj.dataCase.push(val.case);
			retObj.dataDeath.push(val.death);
		});
		return retObj;
	}

	public buildBarChart(barCanvas: any, dataSet: any) {
		let c = null;
		if (this.barChart[barCanvas.nativeElement.id]) {
			this.barChart[barCanvas.nativeElement.id].destroy();
		}
		c = new Chart(barCanvas.nativeElement, {
			type: 'line',
			data: {
				labels: dataSet.label,
				datasets: [
					{
						label: 'Total Cases',
						backgroundColor: '#3dc2ff',
						borderColor: '#3dc2ff',
						data: dataSet.dataCase,
						fill: false,
						yAxisID: 'first-y-axis',
						fontSize: 20
					},
					{
						label: 'Total Deaths',
						fill: false,
						backgroundColor: '#ffd534',
						borderColor: '#ffd534',
						data: dataSet.dataDeath,
						yAxisID: 'second-y-axis',
						fontSize: 20
					}
				]
			},
			options: {
				scales: {
					yAxes: [
						{
							id: 'first-y-axis',
							type: 'linear',
							position: 'left',
							ticks: {
								beginAtZero: false,
								autoSkip: false,
								fontColor: '#3dc2ff'
							},
							gridLines: {
								display: false
							}
						},
						{
							id: 'second-y-axis',
							type: 'linear',
							position: 'right',
							ticks: {
								beginAtZero: false,
								autoSkip: false,
								fontColor: '#ffd534'
							},
							gridLines: {
								display: false
							}
						}
					]
				},
				legend: {
					display: true,
					position: 'bottom',
					labels: {
						fontColor: '#2fdf75'
					}
				},
				tooltips: {
					position: 'nearest',
					backgroundColor: 'black',
					titleFontSize: 18,
					fontColor: 'green',
					mode: 'nearest'
				}
			}
		});
		this.barChart[barCanvas.nativeElement.id] = c;
	}

	private randomScalingFactor() {
		return Math.random() * 10;
	}
}
