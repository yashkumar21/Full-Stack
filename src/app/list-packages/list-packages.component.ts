import { Component } from '@angular/core';
import { Package } from '../model/Package';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { Driver } from '../model/Driver';
import { UppercasePipe } from '../uppercase.pipe';
import { KgToGramsPipe } from '../kg-to-grams.pipe';


@Component({
  selector: 'app-list-packages',
  standalone: true,
  imports: [KgToGramsPipe,UppercasePipe],
  templateUrl: './list-packages.component.html',
  styleUrl: './list-packages.component.css'
})
export class ListPackagesComponent {
  packagesList: Package[] = [];  

  packageClicked: Package | null = null;

  driverInfo: Driver | null = null; 
  
  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit() {
    this.db.getPackage().subscribe(
      (data: any) => {
        this.packagesList = data;  
      },
      (error) => {
        console.error('Error fetching packages:', error);
      }
    );
  }

  showDrivers(package1:Package){

    if (this.packageClicked === package1) {
      this.packageClicked = null;
      this.driverInfo = null; 
      return;
    }

    this.packageClicked = package1;
      console.log(package1.driver_id);
      this.db.listDrivers().subscribe(
        (drivers: any) => {
          const assignedDriver = drivers.find((driver: Driver) => driver.driver_id === package1.driver_id);
          if (assignedDriver) {
            this.driverInfo = assignedDriver;
          } else {
            this.driverInfo = null; 
          }
        },
        (error) => {
          console.error('Error fetching driver details:', error);
          this.driverInfo = null;
        }
      );
    }

  


  deletePackage(id:string){
    this.db.deletePackage(id).subscribe(
      () => {
        this.packagesList = this.packagesList.filter(packages => packages._id !== id); 
      },
      (error) => {
        console.error('Error deleting package:', error);
      }
    );
  }
  

}
