import { Component, OnInit } from '@angular/core';
import { Package } from '../model/Package';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { KgToGramsPipe } from '../kg-to-grams.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-distance',
  standalone: true,
  imports: [KgToGramsPipe, CommonModule],
  templateUrl: './get-distance.component.html',
  styleUrl: './get-distance.component.css'
})
export class GetDistanceComponent implements OnInit {
  packageList: Package[] = [];
  selectedPackage: Package | null = null;
  socket: any;

  constructor(private db: DatabaseService, private router: Router) {
    // Initialize socket connection
    this.socket = io();
    console.log(this.socket);

    // Listen for the distance result from the backend
    this.socket.on('distance', (data: any) => {
      const result = data.distance;
      console.log(result);

      // Find the selected package by ID and update its distance
      const id = this.selectedPackage?._id;
      const packageItem = this.packageList.find(pkg => pkg._id === id);
      if (packageItem) {
        packageItem.distance = `Approximately: ${result}`;
        console.log(packageItem.distance);
      }
    });
  }

  ngOnInit() {
    // Fetch all packages from the backend
    this.db.getPackage().subscribe(
      (data: any) => {
        this.packageList = data.map((item: any) => ({
          _id: item._id || '',
          package_title: item.package_title || '',
          package_weight: item.package_weight || 0,
          package_destination: item.package_destination || '',
          description: item.description || '',
          isAllocated: item.isAllocated || false,
          driver_id: item.driver_id || '',
          distance: null // Initialize distance as null
        }));
      },
      (error) => {
        console.error('Error fetching packages:', error);
      }
    );
  }

  // Trigger the distance calculation process
  generate(packages: Package) {
    this.selectedPackage = packages;
    this.socket.emit('getdistance', { destination: packages.package_destination });
  }
}