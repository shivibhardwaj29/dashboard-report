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
    'volume',
    'issue',
    'copyright',
    'newProof',
    'pages',
    'onHold',
    'comments',
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
      'Volume',
      'Issue',
      'Copyright',
      'New Proof',
      'Pages',
      'On Hold',
      'Comments',
    ];

    const csvRows = this.data?.map((item: any) => [
      item?.journal_acronym || '',
      item?.manuscriptNumber || '',
      item?.article_type || '',
      item?.assigned_to || '',
      item?.task_name || '',
      this.formatDate(item?.stage_received_date),
      this.formatDate(item?.due_date),
      this.calculateDaysAtCurrentStage(item?.stage_received_date),
      item?.volume_no || '',
      item?.issue_no || '',
      item?.copyright_statement || '',
      '0',
      item?.pageCount || '0',
      item?.onHold || '-',
      item?.comments || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row: any) =>
        row
          .map((field: any, i: number) => {
            const isDateField = i === 5 || i === 6;
            return `"${isDateField ? '\t' + field : field}"`;
          })
          .join(',')
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

  calculateDaysAtCurrentStage(startDate: string | Date): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInMs = today.getTime() - start.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }
}
