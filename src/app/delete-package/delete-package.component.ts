import { Component } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { Package } from '../model/Package';
import { KgToGramsPipe } from '../kg-to-grams.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-package',
  standalone: true,
  imports: [KgToGramsPipe, CommonModule],
  templateUrl: './delete-package.component.html',
  styleUrl: './delete-package.component.css'
})
export class DeletePackageComponent {
  // List to hold packages
  packagesList: Package[] = [];  

  // Injecting DatabaseService and Router
  constructor(private db: DatabaseService, private router: Router) {}

  // On component initialization, fetch the packages
  ngOnInit() {
    this.db.getPackage().subscribe(
      (data: any) => {
        // Assign fetched data to packagesList
        this.packagesList = data; 
      },
      (error) => {
        // Log error if fetching packages fails
        console.error('Error fetching packages:', error);
      }
    );
  }

  // Method to delete a package by ID
  deletePackage(id: string) {
    this.db.deletePackage(id).subscribe(
      () => {
        // Navigate to the list-packages route after deletion
        this.router.navigate(['list-packages']);
      },
      (error) => {
        // Log error if deleting package fails
        console.error('Error deleting package:', error);
      }
    );
  }
}