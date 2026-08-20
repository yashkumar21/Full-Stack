import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatabaseService } from '../database.service';
import { io } from 'socket.io-client';
import { Driver } from '../model/Driver';
import { Router } from '@angular/router';
import { UppercasePipe } from '../uppercase.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Needed for ngModel

@Component({
  selector: 'app-text-to-speech',
  standalone: true,
  imports: [UppercasePipe, CommonModule, FormsModule],
  templateUrl: './text-to-speech.component.html',
  styleUrl: './text-to-speech.component.css'
})
export class TextToSpeechComponent {
  driverList: Driver[] = [];  // List of drivers
  socket: any = null;  // Socket.io connection
  chosenDriver: Driver | null = null;  // Define chosenDriver to store the current selected driver
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;  // Audio player element reference

  constructor(
    private db: DatabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef to manually trigger UI updates
  ) {
    // Connect to the backend via Socket.io
    this.socket = io('http://localhost:8080');

    // Handle the successful Text-to-Speech (TTS) response from the backend
    this.socket.on('ttsSuccess', (data: any) => {
      console.log('Received audio path:', data.audioPath);  // Check if the audio path is logged

      // Update the chosenDriver with the received audio path
      if (this.chosenDriver) {
        this.chosenDriver.driver_audio = data.audioPath;
        this.cdr.detectChanges();  // Manually trigger change detection to update the UI
      }
    });
  }

  // Load the driver list when the component is initialized
  ngOnInit() {
    this.db.listDrivers().subscribe((data: any) => {
      console.log('Fetched driver data:', data);

      // Process each driver and add to the driverList
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const driver = new Driver();

        driver._id = item._id;
        driver.driver_name = item.driver_name;
        driver.driver_department = item.driver_department;
        driver.driver_licence = item.driver_licence;
        driver.driver_isActive = item.driver_isActive;
        driver.driver_id = item.driver_id;
        driver.driver_packages = item.packages || [];
        driver.driver_audio = null;  // Initialize with no audio

        this.driverList.push(driver);  // Add the driver to the driverList
      }

      console.log('Driver list after processing:', this.driverList);
    });
  }

  // Trigger the Text-to-Speech conversion for a specific driver
  convertToSpeech(driverLicense: string, driver: Driver) {
    this.chosenDriver = driver;  // Set the current driver as the chosen driver
    console.log('Sending driver license to backend:', driverLicense);

    // Emit the text-speech event to the backend with the driver license text
    this.socket.emit('text-speech', { text: driverLicense });
  }
}