import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Driver } from '../model/Driver';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-driver',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-driver.component.html',
  styleUrls: ['./add-driver.component.css']
})
export class AddDriverComponent {
  driver: Driver = new Driver();

  constructor(private db: DatabaseService, private router: Router) {
    console.log('AddDriverComponent loaded');
  }

  addDriver() {
    console.log('addDriver method called');
    console.log('Driver object:', this.driver);
    if (!this.validateDriver(this.driver)) {
      console.log('Validation failed');
      this.router.navigate(['invalid-page']);
    } else {
      this.db.addDriver(this.driver).subscribe((data: any) => {
        console.log('Driver created:', data);
        this.router.navigate(['list-drivers']);
      });
    }
  }

  private validateDriver(driver: Driver): boolean {
    const validators: { [key: string]: () => boolean } = {
      name: () => this.isValidDriverName(driver.driver_name),
      department: () => this.isValidDriverDepartment(driver.driver_department),
      licence: () => this.isValidDriverLicence(driver.driver_licence),
      isActive: () => typeof driver.driver_isActive === 'boolean',
    };

    for (const [key, validate] of Object.entries(validators)) {
      const isValid = validate();
      console.log(`${key}: ${isValid}`);
      if (!isValid) {
        console.log(`${key} error`);
        return false;
      }
    }

    return true;
  }

  private isValidDriverName(name: string): boolean {
    const nameRegex = /^[a-zA-Z]{3,20}$/;
    return nameRegex.test(name);
  }

  private isValidDriverDepartment(department: string): boolean {
    const validDepartments = ["Food", "Furniture", "Electronic"];
    return validDepartments.includes(department);
  }

  private isValidDriverLicence(licence: string): boolean {
    const licenceRegex = /^[a-zA-Z0-9]{5}$/;
    return licenceRegex.test(licence);
  }
}