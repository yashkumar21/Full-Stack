import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';
import { Driver } from '../model/Driver';

@Component({
  selector: 'app-update-driver',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-driver.component.html',
  styleUrls: ['./update-driver.component.css']
})
export class UpdateDriverComponent implements OnInit {
  driver: Driver = new Driver();
  driverList: Driver[] = [];

  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit() {
    // Fetch the list of drivers when the component is initialized
    this.db.listDrivers().subscribe((data: any) => {
      this.driverList = data;
    });
  }

  // This function will handle form submission
  onSubmit() {
    if (this.validateDriver()) {
      this.db.updateDriver(this.driver).subscribe(
        response => {
          // On successful update, navigate to the list of drivers
          this.router.navigate(['list-drivers']);
        },
        error => {
          console.error('Error updating driver', error);
        }
      );
    } else {
      // Redirect to an invalid page if validation fails
      this.router.navigate(['invalid-data']);
    }
  }

  private validateDriver(): boolean {
    const { _id, driver_department, driver_licence } = this.driver;
  
    // Check if the driver ID exists in the list
    const driverExists = this.driverList.some(driver => driver._id === _id);
    if (!driverExists) {
      console.error('Driver ID not found in the driver list.');
      return false;
    }
  
    // Validate department and license in one pass
    const validDepartments = ['Food', 'Furniture', 'Electronic'];
    const isValidDepartment = validDepartments.includes(driver_department);
    const isValidLicence = /^[a-zA-Z0-9]{5}$/.test(driver_licence);
  
    if (!isValidDepartment) {
      console.error('Invalid department:', driver_department);
      return false;
    }
  
    if (!isValidLicence) {
      console.error('Invalid license:', driver_licence);
      return false;
    }
  
    return true;
  }
}
