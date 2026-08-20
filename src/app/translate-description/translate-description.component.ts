import { Component, OnInit } from '@angular/core';
import { Package } from '../model/Package';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { io } from 'socket.io-client';
import { KgToGramsPipe } from '../kg-to-grams.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-translate-description',
  standalone: true,
  imports: [FormsModule, KgToGramsPipe, CommonModule],
  templateUrl: './translate-description.component.html',
  styleUrl: './translate-description.component.css'
})
export class TranslateDescriptionComponent implements OnInit {
  // List to hold packages
  packageList: Package[] = [];
  // Selected language for translation
  languageChosen: string = '';
  // Socket connection
  socket: any;
  // Response from the server
  response: string = '';
  // Currently selected package for translation
  selectedPackage: Package | null = null;

  constructor(private db: DatabaseService, private router: Router) {
    // Initialize socket connection
    this.socket = io();
    console.log(this.socket);

    // Listen for the translation result from the backend
    this.socket.on('translationResult', (data: any) => {
      const result = {
        description: data.description,
        languageChosen: data.languageChosen,
        translation: data.translation
      };

      console.log('Translation Result:', result);

      // Find the selected package by ID and push the translation into its result array
      const id = this.selectedPackage?._id;
      const packageItem = this.packageList.find(pkg => pkg._id === id);
      if (packageItem) {
        packageItem.result.push(result);
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
          result: [] // Store the translations here
        }));
      },
      (error) => {
        console.error('Error fetching packages:', error);
      }
    );
  }

  // Trigger the translation process
  translate(packages: Package, id: number) {
    console.log('Language chosen:', this.languageChosen);
    this.selectedPackage = packages; // Save the currently selected package

    if (packages.description && this.languageChosen) {
      const languageCode: any = {
        'Russian': 'ru',
        'Spanish': 'es',
        'German': 'de',
      };

      const targetLanguageCode = languageCode[this.languageChosen];
      console.log('Target language code:', targetLanguageCode);

      // Emit the translation request to the backend
      this.socket.emit('translate', {
        description: packages.description,
        targetLanguageCode: targetLanguageCode,
        languageChosen: this.languageChosen
      });
    } else {
      console.log('Invalid data or language not chosen');
      this.router.navigate(['invalid-data']);
    }
  }
}