import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold m-0 text-dark">Clinic Analytics</h2>
          <p class="text-muted m-0">Performance insights and appointment statistics</p>
        </div>
        <div class="d-flex gap-2">
            <div class="custom-dropdown-container">
                <button type="button" class="btn period-btn rounded-pill px-4" (click)="toggleDropdown($event)" [disabled]="loading">
                    <span class="me-2">{{ currentPeriod | titlecase }}</span>
                    <i class="bi" [class.bi-chevron-down]="!isDropdownOpen" [class.bi-chevron-up]="isDropdownOpen"></i>
                </button>
                <div class="custom-dropdown-menu shadow-lg" *ngIf="isDropdownOpen">
                    <div class="dropdown-item-custom" (click)="selectPeriod('daily')" [class.active]="currentPeriod === 'daily'">Daily</div>
                    <div class="dropdown-item-custom" (click)="selectPeriod('weekly')" [class.active]="currentPeriod === 'weekly'">Weekly</div>
                    <div class="dropdown-item-custom" (click)="selectPeriod('monthly')" [class.active]="currentPeriod === 'monthly'">Monthly</div>
                </div>
            </div>
            <button type="button" class="btn btn-danger rounded-pill px-4 text-nowrap text-white" (click)="exportCsv()" [disabled]="loading">
                <i class="bi bi-download me-2"></i>
                {{ loading ? 'Generating...' : 'Export CSV' }}
            </button>
        </div>
      </div>

      <div *ngIf="loading" class="d-flex justify-content-center align-items-center" style="height: 300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
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
            <div class="list-group list-group-flush" *ngIf="topDoctors && topDoctors.length > 0; else noDoctors">
                <div *ngFor="let doc of topDoctors" class="list-group-item px-0 border-0 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-info text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">{{ doc.name ? doc.name[0] : 'D' }}</div>
                        <div class="fw-bold small">{{ doc.name }}</div>
                    </div>
                    <span class="badge bg-light text-dark rounded-pill">{{ doc.appointmentCount }}</span>
                </div>
            </div>

            <ng-template #noDoctors>
                <div class="text-center py-5">
                    <i class="bi bi-people text-muted mb-3 d-block" style="font-size: 2.5rem; opacity: 0.3;"></i>
                    <p class="text-muted small m-0 fst-italic">No consultant records found for selected period.</p>
                </div>
            </ng-template>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
        font-family:'Open Sans', sans-serif;
    }
    .custom-dropdown-container {
        position: relative;
        display: inline-block;
    }
    .period-btn {
        background-color: #4e73df;
        color: white;
        border: none;
        font-weight: 600;
        min-width: 130px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;
    }
    .period-btn:hover {
        background-color: #2e59d9;
        color: white;
    }
    .period-btn:focus {
        box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
    }
    .custom-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        background-color: white;
        min-width: 100%;
        border-radius: 12px;
        z-index: 1000;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
        animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-item-custom {
        padding: 10px 20px;
        color: #4a5568;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    .dropdown-item-custom:hover {
        background-color: #4e73df;
        color: white;
    }
    .dropdown-item-custom.active {
        background-color: #f7fafc;
        color: #4e73df;
        font-weight: 600;
    }
    .dropdown-item-custom.active:hover {
        background-color: #4e73df;
        color: white;
    }
  `]
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  topDoctors: any[] = [];
  peakHours: any[] = [];
  loading: boolean = true;
  currentPeriod: string = 'daily';
  isDropdownOpen: boolean = false;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectPeriod(period: string) {
    this.isDropdownOpen = false;
    this.loadData(period);
  }
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  private destroy$ = new Subject<void>();

  constructor(private reportingService: ReportingService, private cdr: ChangeDetectorRef, private eRef: ElementRef) { }

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
      tooltip: { enabled: false },
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
        data: data.map((d, index) => ({
          y: d.appointmentCount,
          dataLabels: { y: index % 2 === 0 ? -30 : 25 }
        })),
        color: '#0dcaf0',
        marker: { enabled: true }
      }],
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            allowOverlap: true,
            format: '<div style="text-align: center; line-height: 1.2;"><div style="font-size: 9px; color: #6c757d;">{point.category}</div><div style="font-size: 11px; font-weight: bold; color: #5a5c69;">{y} <span style="font-weight: normal; font-size: 9px;">Appts</span></div></div>',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderWidth: 1,
            borderColor: '#cccccc',
            borderRadius: 4,
            padding: 4,
            shadow: {
              color: 'rgba(0, 0, 0, 0.1)',
              width: 3,
              offsetX: 0,
              offsetY: 1
            }
          },
          enableMouseTracking: true
        }
      }
    };
  }
}
