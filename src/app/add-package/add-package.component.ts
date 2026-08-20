import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Package } from '../model/Package';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-package',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './add-package.component.html',
  styleUrl: './add-package.component.css'
})
export class AddPackageComponent {
  package:Package=new Package();

  drivers: any[] = [];

  constructor(private db: DatabaseService, private router: Router) {}


  ngOnInit() {
    this.db.listDrivers().subscribe(
      (data: any) => {
        console.log(data)
        this.drivers = data; 
      },
      (error) => {
        console.error('Error  drivers:', error);
      }
    );
  }


  addPackage(){
    if(this.validatePackage(this.package)){
    this.db.addPackage(this.package).subscribe((data:any)=>{
      this.router.navigate(['list-packages']);
    })
  }else{
    this.router.navigate(['invalid-data']);
  }
  }

   private validatePackage(packages: Package): boolean {
    const validators: { [key: string]: () => boolean } = {
      title: () => this.isValidPackageTitle(packages.package_title),
      weight: () => this.isValidPackageWeight(packages.package_weight),
      destination: () => this.isValidPackageDestination(packages.package_destination),
      description: () => this.isValidDescription(packages.description),
      driverId: () => this.isValidDriverId(packages.driver_id),
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
  
  private isValidPackageTitle(title: string): boolean {
    const titleRegex = /^[a-zA-Z0-9 ]{3,15}$/;
    return titleRegex.test(title);
  }
  
  private isValidPackageWeight(weight: number): boolean {
    return typeof weight === 'number' && weight > 0;
  }
  
  private isValidPackageDestination(destination: string): boolean {
    const destinationRegex = /^[a-zA-Z0-9 ]{5,15}$/;
    return destinationRegex.test(destination);
  }
  
  private isValidDescription(description: string): boolean {
    return description.length <= 30;
  }
  
  private isValidDriverId(driverId: string): boolean {
    return driverId.trim() !== '';
  }
}