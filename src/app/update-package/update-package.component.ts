import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Package } from '../model/Package';

@Component({
  selector: 'app-update-package',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-package.component.html',
  styleUrls: ['./update-package.component.css']
})
export class UpdatePackageComponent implements OnInit {
  package: Package = new Package(); // Object to hold form data
  packageList: Package[] = [];

  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit() {
    // Fetch packages to validate ID (if needed)
    this.db.getPackage().subscribe(
      (data: any) => {
        this.packageList = data;
      },
      (error) => {
        console.error('Error fetching packages:', error);
      }
    );
  }

  updatePackage() {
    // Check if package ID and destination are valid
    if (this.validatePackage()) {
      // Sending the package object to the service
      this.db.updatePackage({
        package_id: this.package._id,
        package_destination: this.package.package_destination
      }).subscribe(
        (response) => {
          console.log('Package updated successfully:', response);
          this.router.navigate(['/list-packages']); // Redirect to list after update
        },
        (error) => {
          console.error('Error updating package:', error);
        }
      );
    } else {
      this.router.navigate(['/invalid-data']); // Handle invalid case
    }
  }

  private validatePackage(): boolean {
    // Validate if the package ID exists in the packageList
    if (!this.packageList.some(pkg => pkg._id === this.package._id)) {
      console.log('Invalid package ID');
      return false;
    }
    if (!this.isValidPackageDestination(this.package.package_destination)) {
      console.log('Invalid package destination');
      return false;
    }
    return true;
  }

  private isValidPackageDestination(destination: string): boolean {
    // Validate package destination format (adjust regex as needed)
    const destinationRegex = /^[a-zA-Z0-9 ]{5,15}$/;
    return destinationRegex.test(destination);
  }
}
