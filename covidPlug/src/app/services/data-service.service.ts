import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Chart from 'chart.js';
@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  public dataSrc: any = {};
  public parsedDataSrc: any = {};
  public stateDataWithUiData: any = {};
  public totalDataSet: any = {
    totalCases: 0,
    totalDeaths: 0,
    time30data: [],
  };
  public menuData: any = [{ id: '', text: 'Select a State' }];
  public barChart: any = {};

  constructor() {}

  public fetchData() {
    return new Promise((resolve, reject) => {
      Papa.parse(
        'http://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv',
        {
          download: true,
          complete: (results) => {
            this.dataSrc = results.data;
            this.parseData();
            this.getTotalValues();
            resolve(true);
          },
        }
      );
    });
  }

  private parseData() {
    _.each(this.dataSrc, (val, ind) => {
      if (ind !== 0) {
        if (this.parsedDataSrc[val[1]]) {
          this.parsedDataSrc[val[1]].push(this.craftObj(val));
        } else {
          this.parsedDataSrc[val[1]] = [this.craftObj(val)];
        }
      }
    });
  }

  // get total death, infection by country
  private getTotalValues() {
    _.map(this.parsedDataSrc, (data, key) => {
      const revArr = data.reverse();
      this.totalDataSet.date = revArr[0].date.format('YYYY-MM-DD');
      this.stateDataWithUiData[key] = {
        totalCases: revArr[0].case,
        totalDeaths: revArr[0].death,
        time30data: _.slice(revArr, 0, 30),
        date: revArr[0].date.format('YYYY-MM-DD'),
      };
      this.totalDataSet.totalCases += revArr[0].case;
      this.totalDataSet.totalDeaths += revArr[0].death;

      _.each(this.stateDataWithUiData[key].time30data, (val, ind) => {
        if (this.totalDataSet.time30data[ind]) {
          this.totalDataSet.time30data[ind].case += val.case;
          this.totalDataSet.time30data[ind].death += val.death;
        } else {
          this.totalDataSet.time30data[ind] = {
            date: val.date,
            case: val.case,
            death: val.death,
          };
        }
      });
      this.menuData.push({
        id: key,
        text: key,
      });
    });
    this.menuData = _.orderBy(this.menuData, 'id');
  }

  private craftObj(obj): any {
    const retObj: any = {
      date: moment(obj[0]),
      fips: obj[2],
      case: +obj[3],
      death: +obj[4],
    };
    return retObj;
  }

  public prepareLineData(data) {
    const retObj: any = {
      label: [],
      dataCase: [],
      dataDeath: [],
    };
    _.each(_.slice(data.time30data, 0, 30).reverse(), (val) => {
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
            yAxisID: 'first-y-axis'
          },
          {
            label: 'Total Deaths',
            fill: false,
            backgroundColor: '#eb445a',
            borderColor: '#eb445a',
            data: dataSet.dataDeath,
            yAxisID: 'second-y-axis'
          },
        ],
      },
    options: {
      legend: {
        display: true,
        position: 'bottom',
      },
      scales: {
          yAxes: [{
              id: 'first-y-axis',
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: false,
                autoSkip: false,
                fontColor: '#3dc2ff',
            },
            gridLines: {
              display: false
          }
          }, {
              id: 'second-y-axis',
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: false,
                autoSkip: false,
                fontColor: '#eb445a'
            },
            gridLines: {
              display: false
          }
          }]
      }
  }
    });
    this.barChart[barCanvas.nativeElement.id] = c;
  }

  private randomScalingFactor() {
    return Math.random() * 10;
   }

}


