import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from '../../services/reporting.service';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  template: `
    <div class="reports-container p-4 bg-light min-vh-100">
      <div *ngIf="loading" class="d-flex justify-content-center align-items-center" style="height: 300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div *ngIf="!loading" class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold m-0 text-dark">Clinic Analytics</h2>
          <p class="text-muted m-0">Performance insights and appointment statistics</p>
        </div>
        <div class="d-flex gap-2">
            <select class="form-select form-select-sm rounded-pill px-3" (change)="onPeriodChange($event)" [disabled]="loading">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
            <button type="button" class="btn btn-primary rounded-pill px-4" (click)="exportCsv()" [disabled]="loading">
                <i class="bi bi-download me-2"></i>
                {{ loading ? 'Generating...' : 'Export CSV' }}
            </button>
        </div>
      </div>

      <div class="row g-4 mb-4" *ngIf="!loading && stats">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-primary">
            <div class="text-muted small fw-bold text-uppercase">Total Appointments</div>
            <div class="h3 fw-bold m-0 mt-1">{{ stats.totalAppointments || 0 }}</div>
            <div class="text-primary small mt-2"><i class="bi bi-calendar-range me-1"></i>{{ currentPeriod | titlecase }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-danger">
            <div class="text-muted small fw-bold text-uppercase">Cancellation Rate</div>
            <div class="h3 fw-bold m-0 mt-1 text-danger">{{ stats.cancellationRate | number:'1.1-1' }}%</div>
            <div class="text-muted small mt-2"><i class="bi bi-info-circle me-1"></i>For {{ currentPeriod }}</div>
          </div>
        </div>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm p-4 h-100">
            <h6 class="fw-bold mb-4">Peak Appointment Hours</h6>
            <div style="height: 400px; display: block;">
                <highcharts-chart 
                    [options]="chartOptions"
                    style="width: 100%; height: 100%; display: block;">
                </highcharts-chart>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm p-4 h-100">
            <h6 class="fw-bold mb-4">Top Consultants</h6>
            <div class="list-group list-group-flush">
                <div *ngFor="let doc of topDoctors" class="list-group-item px-0 border-0 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-info text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">{{ doc.name ? doc.name[0] : 'D' }}</div>
                        <div class="fw-bold small">{{ doc.name }}</div>
                    </div>
                    <span class="badge bg-light text-dark rounded-pill">{{ doc.appointmentCount }}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
        font-family: 'Inter', sans-serif;
    }
  `]
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  topDoctors: any[] = [];
  peakHours: any[] = [];
  loading: boolean = true;
  currentPeriod: string = 'daily';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  private destroy$ = new Subject<void>();

  constructor(private reportingService: ReportingService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(period: string = 'daily') {
    this.currentPeriod = period;
    this.loading = true;
    this.cdr.detectChanges();


    this.reportingService.getCancellationStats(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.stats = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });

    this.reportingService.getTopDoctors(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.topDoctors = res;
        this.cdr.detectChanges();
      });

    this.reportingService.getPeakHours(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.peakHours = res;
        this.updateChart(res);
        this.cdr.detectChanges();
      });
  }

  onPeriodChange(event: any) {
    this.loadData(event.target.value);
  }

  exportCsv() {
    const period = this.currentPeriod;
    this.reportingService.exportCsv(period)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => alert('Failed to generate report. Please try again.')
      });
  }

  updateChart(data: any[]) {
    this.chartOptions = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent'
      },
      title: { text: '' },
      credits: { enabled: false },
      xAxis: {
        categories: data.map(d => `${d.hour}:00`),
        labels: { style: { color: '#6c757d' } }
      },
      yAxis: {
        title: { text: 'Appointments' },
        min: 0,
        gridLineDashStyle: 'Dash'
      },
      series: [{
        name: 'Appointments',
        type: 'line',
        data: data.map(d => d.appointmentCount),
        color: '#0dcaf0',
        marker: { enabled: true }
      }],
      plotOptions: {
        line: {
          dataLabels: { enabled: true },
          enableMouseTracking: true
        }
      }
    };
  }
}
