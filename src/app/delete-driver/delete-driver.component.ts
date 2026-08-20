import { Component } from '@angular/core';
import { Driver } from '../model/Driver';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { UppercasePipe } from '../uppercase.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-driver',
  standalone: true,
  imports: [CommonModule, UppercasePipe],
  templateUrl: './delete-driver.component.html',
  styleUrl: './delete-driver.component.css'
})
export class DeleteDriverComponent {
  // List to hold drivers
  driversList: Driver[] = [];

  // Injecting DatabaseService and Router
  constructor(private db: DatabaseService, private router: Router) {}

  // On component initialization, fetch the drivers
  ngOnInit() {
    this.db.listDrivers().subscribe(
      (data: any) => {
        // Assign fetched data to driversList
        this.driversList = data;
      },
      (error) => {
        // Log error if fetching drivers fails
        console.error('Error fetching drivers:', error);
      }
    );
  }

  // Method to delete a driver by ID
  deleteDriver(id: string) {
    this.db.deleteDriver(id).subscribe(
      (data: any) => {
        // Navigate to the list-drivers route after deletion
        this.router.navigate(['list-drivers']);
      },
      (error) => {
        // Log error if deleting driver fails
        console.error('Error deleting driver:', error);
      }
    );
  }
}