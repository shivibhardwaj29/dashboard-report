import { environment } from '../../../environments/environment';

export const ENDPOINTS = {
  journals: `${environment.apiBaseUrl}rest/journal/pe_journal_list/ALL`,
  fetchReport: `${environment.apiBaseUrl}rest/journal/issue_assignment_delayed_articles/`,
};
