import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ReportComponent } from './report/report.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WipReportComponent } from './wip-report/wip-report.component';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WipDetailModalComponent } from './wip-report/wip-detail-modal/wip-detail-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [ReportComponent, WipReportComponent, WipDetailModalComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgApexchartsModule,
    MatDialogModule
  ],
  exports: [ReportComponent],
})
export class PagesModule {}
