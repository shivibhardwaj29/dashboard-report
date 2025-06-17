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
      staffMember: ['', Validators.required],
      productionStaffGroup: [[]],
      journal: [[]],
    });

    // ✅ Load options only after JWT token is available
    this.jwtService.jwtToken$
      .pipe(
        filter((token) => !!token),
        take(1)
      )
      .subscribe(() => this.loadOptions());
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
          );

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
      });
  }

  onSubmit() {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;

      const staffMemberId = formValue?.staffMember;
      const productionGroupIds =
        formValue?.productionStaffGroup?.length > 0
          ? formValue.productionStaffGroup?.join(',')
          : 'ALL';
      const journalIds =
        formValue?.journal?.length > 0 ? formValue.journal?.join(',') : 'ALL';

      const url = `${ENDPOINTS.fetchReport}${productionGroupIds}/${staffMemberId}/${journalIds}`;
      console.log(url, 'url');

      this.httpService.getData(url, null, true).subscribe({
        next: (res: any) => {
          console.log(res, 'res');
          this.wipReportData = res;
          this.showWIPReport = true;
        },
        error: (err) => {
          console.error('Error fetching report:', err);
          this.showWIPReport = false;
        },
      });
    }
  }

  onReset() {
    this.filterForm.reset();
    this.showWIPReport = false;
  }
}
