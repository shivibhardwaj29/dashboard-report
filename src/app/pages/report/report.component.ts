import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../core/services/http.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { JwtTokenService } from '../../core/services/jwt-token.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  filterForm!: FormGroup;
  staffMembers: { label: string; value: any }[] = [];
  productionGroups: { label: string; value: any }[] = [];
  journals: { label: string; value: any }[] = [];
  showWIPReport = false;
  wipReportData = [];
  apiData: any = [];

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private jwtService: JwtTokenService
  ) {}

  isLoading: any = this.httpService.loading$;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      staffMember: [[], Validators.required],
      productionStaffGroup: [[]],
      journal: [[]],
    });
    this.loadOptions();

    // this.jwtService.jwtToken$
    //   .pipe(
    //     filter((token) => !!token),
    //     take(1)
    //   )
    //   .subscribe(() => this.loadOptions());
  }

  loadOptions(): void {
    this.httpService
      .getData(ENDPOINTS.journals, null, true)
      .subscribe((res: any) => {
        if (!Array.isArray(res)) return;

        this.apiData = res;

        const seenJournalIds = new Set();
        this.journals = res
          .map((item) => ({
            label: item?.journal_acronym || 'Unknown Journal',
            value: item?.journal_id,
          }))
          .filter(
            (opt) =>
              opt.label &&
              opt.value &&
              !seenJournalIds.has(opt.value) &&
              seenJournalIds.add(opt.value)
          );

        const seenEditorIds = new Set();
        this.staffMembers = res
          .map((item) => ({
            label: item?.production_editor_name || 'Unknown Editor',
            value: item?.production_editor_id,
          }))
          .filter(
            (opt) =>
              opt.label &&
              opt.value &&
              !seenEditorIds.has(opt.value) &&
              seenEditorIds.add(opt.value)
          )
          .sort((a, b) => a.label.localeCompare(b.label));

        const seenGroupIds = new Set();
        this.productionGroups = res
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
          );

        this.filterForm.patchValue({
          productionStaffGroup: [
            'ALL',
            ...this.productionGroups.map((g) => g.value),
          ],
          journal: ['ALL', ...this.journals.map((j) => j.value)],
        });
      });
  }
  onSubmit() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const formValue = this.filterForm.value;
    const staffMemberIds = formValue.staffMember;

    const productionGroupIds =
      formValue.productionStaffGroup?.length > 0
        ? formValue.productionStaffGroup.join(',')
        : 'ALL';

    const journalIds =
      formValue.journal?.length > 0 ? formValue.journal.join(',') : 'ALL';

    const staffIds = staffMemberIds.join(',');
    const url = `${ENDPOINTS.fetchReport}${productionGroupIds}/${staffIds}/${journalIds}`;
    console.log(url, 'url');

    this.httpService.getData(url, null, true).subscribe({
      next: (res: any) => {
        this.wipReportData = res;
        this.showWIPReport = true;
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.showWIPReport = false;
      },
    });
  }

  onReset() {
    this.filterForm.reset();
    this.showWIPReport = false;
  }

  isAllSelected(controlName: string, options: any[]) {
    const selected = this.filterForm.get(controlName)?.value || [];
    return selected.length === options.length;
  }

  toggleItem(controlName: string, value: any, options: any[]) {
    const control = this.filterForm.get(controlName);
    const current: any[] = control?.value || [];
    const exists = current.includes(value);

    const updated = exists
      ? current.filter((v) => v !== value)
      : [...current, value];

    control?.setValue(updated);
  }

  onSelectionChange(field: 'journal' | 'productionStaffGroup', event: any) {
    const control = this.filterForm.get(field);
    const selectedValues: any[] = control?.value || [];

    const allValue = 'ALL';
    const options =
      field === 'journal'
        ? this.journals.map((o) => o.value)
        : this.productionGroups.map((o) => o.value);

    const allOptions = [allValue, ...options];

    const changedValue = event?.option?.value;

    console.log(changedValue, "channnn");
    

    if (changedValue === allValue) {
      if (event.option.selected) {
        control?.setValue(allOptions, { emitEvent: false });
      } else {
        control?.setValue([], { emitEvent: false });
      }
    } else {
      const valuesWithoutAll = selectedValues.filter((v) => v !== allValue);
      const allOtherSelected = options.every((opt) =>
        valuesWithoutAll.includes(opt)
      );

      if (allOtherSelected) {
        control?.setValue(allOptions, { emitEvent: false });
      } else if (selectedValues.includes(allValue)) {
        const updated = selectedValues.filter((v) => v !== allValue);
        control?.setValue(updated, { emitEvent: false });
      }
    }
  }

  getSelectedLabels(fieldName: string): string {
    const selectedValues = this.filterForm.get(fieldName)?.value || [];

    // If "All" is selected, only display "All"
    if (selectedValues.includes('ALL')) {
      return 'All';
    }

    const options =
      fieldName === 'journal'
        ? this.journals
        : fieldName === 'productionStaffGroup'
        ? this.productionGroups
        : [];

    return options
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => o.label)
      .join(', ');
  }
}
