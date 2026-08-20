import { Component } from '@angular/core';
import { DatabaseService } from '../database.service';
import { ChangeDetectorRef } from '@angular/core';  // Import ChangeDetectorRef

@Component({
  selector: 'app-crud-stats',
  standalone: true,
  imports: [],
  templateUrl: './crud-stats.component.html',
  styleUrls: ['./crud-stats.component.css']
})
export class CrudStatsComponent {
  create = 0;
  update = 0;
  retrieve = 0;
  delete = 0;

  constructor(private db: DatabaseService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.db.getStats().subscribe(
      (data: any) => {
        this.create = data.create;
        this.update = data.update;
        this.retrieve = data.retrieve;
        this.delete = data.delete;

        // Trigger change detection manually to update the UI
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error fetching stats:', error);
      }
    );
  }
}