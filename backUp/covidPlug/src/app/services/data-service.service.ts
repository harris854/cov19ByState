import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import * as moment from 'moment';
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
  public menuData: any = [{id: '', text: 'Select a State'}];

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
        date: revArr[0].date.format('YYYY-MM-DD')
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
}
