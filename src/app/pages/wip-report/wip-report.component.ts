import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { MatDialog } from '@angular/material/dialog';
import { WipDetailModalComponent } from './wip-detail-modal/wip-detail-modal.component';

@Component({
  selector: 'app-wip-report',
  templateUrl: './wip-report.component.html',
  styleUrls: ['./wip-report.component.scss'],
})
export class WipReportComponent implements OnChanges {
  @Input() data: any[] = [];
  reportData: any = [];

  chartSeries: ApexAxisChartSeries = [];
  chartColors: string[] = [];
  chartLegend: ApexLegend = {
    position: 'bottom',
  };
  chartPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
    },
  };
  chartDetails: ApexChart = {
    type: 'bar',
    height: 500,
    stacked: true,
    toolbar: {
      show: true,
    },
  };
  chartXAxis: ApexXAxis = { categories: [] };
  chartYAxis: ApexYAxis = {};
  chartTitle: ApexTitleSubtitle = {
    text: 'Tasks Distribution by Name',
    align: 'center',
  };
  chartTooltip: ApexTooltip = {
    shared: true,
    intersect: false,
  };
  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.reportData = changes['data']?.currentValue || [];
      this.prepareChart();
    }
  }

  prepareChart() {
    if (!this.reportData || this.reportData.length === 0) return;

    const statusCategories = [
      'On Schedule',
      'Due Today',
      'Due Tomorrow',
      'Delayed',
      'OnHold',
    ];
    const colorsMap: Record<string, string> = {
      'On Schedule': '#1E90FF',
      'Due Today': '#28a745',
      'Due Tomorrow': '#ffc107',
      Delayed: '#ff4d4f',
      OnHold: '#8e44ad',
    };

    const taskMap: Record<string, Record<string, number>> = {};

    this.reportData.forEach((item: any) => {
      const task = item.task_name || 'Unknown';
      const status = this.getStatus(item.due_date, item.onHold);

      if (!taskMap[task]) {
        taskMap[task] = {};
        statusCategories.forEach((s) => (taskMap[task][s] = 0));
      }

      taskMap[task][status]++;
    });

    const taskNames = Object.keys(taskMap);

    this.chartSeries = statusCategories.map((status) => ({
      name: status,
      data: taskNames.map((task) => taskMap[task][status] || 0),
    }));

    this.chartXAxis = {
      categories: taskNames,
    };

    // this.chartYAxis = {
    //   title: { text: 'Count of Articles' },
    // };
    this.chartColors = statusCategories.map((status) => colorsMap[status]);
  }

  getStatus(dueDate: string, onHold: string): string {
    const today = new Date();
    const due = new Date(dueDate);
    const oneDay = 24 * 60 * 60 * 1000;

    if (onHold?.toLowerCase() === 'yes') return 'OnHold';

    const diffDays = Math.floor((due.getTime() - today.getTime()) / oneDay);

    if (diffDays < 0) return 'Delayed';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return 'On Schedule';
  }

  openDetailedView(): void {
    this.dialog.open(WipDetailModalComponent, {
      width: '80%',
      data: this.reportData,
    });
  }
}
