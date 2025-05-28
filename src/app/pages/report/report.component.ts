import { Component, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../core/services/http.service';
import { ENDPOINTS } from '../../core/api/endpoints';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  filterForm!: FormGroup;
  staffMembers = ['John Doe', 'Jane Smith', 'Alice Johnson'];
  productionGroups = ['Group A', 'Group B', 'Group C'];
  journals = ['Journal 1', 'Journal 2', 'Journal 3'];
  showWIPReport = false;
  wipReportData = [];
  apiData: any = [];
  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  isLoading: any = this.httpService.loading$;
  ngOnInit() {
    this.filterForm = this.fb.group({
      staffMember: ['', Validators.required],
      productionStaffGroup: [[], Validators.required],
      journal: [[], Validators.required],
    });
    this.loadOptions();
  }

  loadOptions(): void {
    this.httpService.getData(ENDPOINTS.journals).subscribe((res: any) => {
      if (!Array.isArray(res)) return;
      this.apiData = res;
      const journalOptions = res
        .map((item) => ({
          label: item?.journal_acronym || 'Unknown Journal',
          value: item?.journal_id,
        }))
        .filter((opt) => opt.label && opt.value)
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.label === value.label)
        );
      this.journals = journalOptions.map((o) => o.label);

      const staffOptions = res
        .map((item) => ({
          label: item?.production_editor_name || 'Unknown Editor',
          value: item?.production_editor_id,
        }))
        .filter((opt) => opt.label && opt.value)
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.label === value.label)
        );
      this.staffMembers = staffOptions.map((o) => o.label);

      const seenGroupIds = new Set();
      const prodStaffOptions = res
        .map((item) => ({
          label: item?.group_Name || 'Unknown Group',
          value: item?.group_id,
        }))
        .filter(
          (opt) =>
            opt.label &&
            opt.value &&
            !seenGroupIds.has(opt.value) &&
            seenGroupIds.add(opt.value)
        )
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.label === value.label)
        );
      this.productionGroups = prodStaffOptions.map((o) => o.label);
    });
  }

  onSubmit() {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      console.log(formValue, 'formValue');
      console.log(this.apiData, 'apiData');

      const filteredData = this.apiData?.filter((item: any) => {
        return (
          item?.production_editor_name === formValue.staffMember &&
          formValue.productionStaffGroup.includes(item?.group_Name) &&
          formValue.journal.includes(item?.journal_acronym)
        );
      });

      console.log(filteredData, 'filteredData');

      this.wipReportData = filteredData;
      this.showWIPReport = true;
    }
  }

  onReset() {
    this.filterForm.reset();
    this, (this.showWIPReport = false);
  }
}
