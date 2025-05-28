import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
} from 'ng-apexcharts';

@Component({
  selector: 'app-wip-report',
  templateUrl: './wip-report.component.html',
  styleUrls: ['./wip-report.component.scss'],
})
export class WipReportComponent implements OnChanges {
  @Input() data: any[] = [];
  reportData: any = [];

  // ApexChart config
  chartSeries: ApexAxisChartSeries = [];
  chartDetails: ApexChart = { type: 'bar', height: 400 };
  chartXAxis: ApexXAxis = { categories: [] };
  chartYAxis: ApexYAxis = { title: { text: 'Tasks' } };
  chartTitle: ApexTitleSubtitle = {
    text: 'Tasks Distribution by Name',
    align: 'center',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.reportData = changes['data']?.currentValue || [];
      this.prepareChart();
    }
  }

  prepareChart() {
    if (!this.reportData || this.reportData.length === 0) return;

    const taskCountMap: Record<string, number> = {};

    this.reportData.forEach((item: any) => {
      const taskName = item.task_name || 'Unknown';
      taskCountMap[taskName] = (taskCountMap[taskName] || 0) + 1;
    });

    this.chartXAxis.categories = Object.keys(taskCountMap);
    this.chartSeries = [
      {
        name: 'Count',
        data: Object.values(taskCountMap),
      },
    ];
  }
}
