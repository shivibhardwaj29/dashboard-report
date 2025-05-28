import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-wip-report',
  templateUrl: './wip-report.component.html',
  styleUrl: './wip-report.component.scss',
})
export class WipReportComponent implements OnChanges {
  @Input() data: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log(changes['data'], 'dataaa incoming');
    }
  }
}
