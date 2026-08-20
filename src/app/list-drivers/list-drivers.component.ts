import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UppercasePipe } from '../uppercase.pipe';
import { Driver } from '../model/Driver';

@Component({
  selector: 'app-list-drivers',
  standalone: true,
  imports: [UppercasePipe, CommonModule],
  templateUrl: './list-drivers.component.html',
  styleUrl: './list-drivers.component.css'
})
export class ListDriversComponent implements OnInit {
  driversList: Driver[] = [];
  driverPackage: Driver | null | undefined;

  constructor(private db: DatabaseService, private router: Router) { }

  ngOnInit() {
    this.db.listDrivers().subscribe((data: any) => {
      this.driversList = data;
    });
  }

  async getPackages(driver: any) {
    if (this.driverPackage === driver) {
      this.driverPackage = null;
      return;
    }

    this.driverPackage = driver;

    try {
      const packages: any = await this.db.getPackage().toPromise();
      driver.driver_packages = packages.filter((pkg: any) => pkg.driver_id === driver.driver_id);
    } catch (error) {
      console.log('Error fetching packages', error);
    }
  }

  deleteDriver(id: string) {
    console.log("Attempting to delete driver with ID:", id); // Debugging log

    this.db.deleteDriver(id).subscribe((data: any) => {
      console.log("Driver deleted successfully:", data); // Debugging log
      this.driversList = this.driversList.filter(drivers => drivers._id !== id);
    },
      (error) => {
        console.error('Error deleting driver:', error);
      });
  }
  
}