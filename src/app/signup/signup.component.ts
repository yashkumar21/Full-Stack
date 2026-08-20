import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'] // Corrected from styleUrl to styleUrls
})
export class SignupComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private db: DatabaseService, private router: Router) {}

  signupUser() {
    const user = { username: this.username, password: this.password, confirmPassword: this.confirmPassword };

    // Log the input values
    console.log('Signup attempt with:', JSON.stringify(user, null, 2));

    if (this.validateUser()) {
      this.db.signupuser(user).subscribe({
        next: (data: any) => {
          console.log('Response from server:', data);
          if (data.status === 'Signup successfully') {
            this.db.isauthenticated = true;
            this.router.navigate(['/login']);
          } else {
            alert('Error: ' + (data.status || 'Unknown error'));
          }
        },
        error: (error) => {
          console.error('Signup error', error);
          alert('Signup failed. Please check your credentials.');
        }
      });
    } else {
      this.router.navigate(['invalid-data']);
    }
  }

  private validateUser(): boolean {
    if (!this.isUsernameValid(this.username)) {
      console.error('Invalid username:', this.username);
      return false;
    }

    if (!this.isPasswordValid(this.password)) {
      console.error('Invalid password:', this.password);
      return false;
    }

    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match:', this.password, this.confirmPassword);
      return false;
    }

    return true;
  }

  private isUsernameValid(username: string): boolean {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(username);
    console.log(`Email validation for ${username}: ${isValid}`);
    return isValid;
  }

  private isPasswordValid(password: string): boolean {
    const isValid = password.length >= 5 && password.length <= 10;
    console.log(`Password validation for ${password}: ${isValid}`);
    return isValid;
  }
}