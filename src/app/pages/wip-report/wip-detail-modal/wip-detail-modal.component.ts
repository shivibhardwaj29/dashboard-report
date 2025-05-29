import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-wip-detail-modal',
  templateUrl: './wip-detail-modal.component.html',
  styleUrls: ['./wip-detail-modal.component.scss'],
})
export class WipDetailModalComponent {
  displayedColumns: string[] = [
    'journal',
    'manuscriptId',
    'articleType',
    'assignedTo',
    'currentTask',
    'taskStartDate',
    'taskDueDate',
    'daysAtCurrentStage',
  ];
  dataSource: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<WipDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource = data;
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  exportAsCSV(): void {
    if (!this.data || !this.data?.length) {
      console.warn('No data to export');
      return;
    }

    const replacer = (key: string, value: any) =>
      value === null || value === undefined ? '' : value;
    const headers = [
      'Journal',
      'Manuscript ID',
      'Manuscript Type',
      'Assigned To',
      'Current Task',
      'Task Start Date',
      'Task Due Date',
      'Days at Current Stage',
    ];

    const csvRows = this.data?.map((item: any) => [
      item.journal_acronym || '-',
      item.manuscriptNumber || '-',
      item.article_type || '-',
      item.assigned_to || '-',
      item.task_name || '-',
      this.formatDate(item.stage_received_date),
      this.formatDate(item.due_date),
      '0',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row: any) =>
        row.map((field: any) => `"${field}"`).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wip-details-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
