import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private db: DatabaseService, private router: Router) {}

  loginUser() {
    const user = { username: this.username, password: this.password };

    // Log the input values
    console.log('Login attempt with:', JSON.stringify(user, null, 2));

    if (this.validateUser()) {
      this.db.loginuser(user).subscribe({
        next: (data: any) => {
          console.log('Response from server:', data);
          if (data.status === 'Login successfully') {
            this.db.isauthenticated = true;
            // Storing the user session
            sessionStorage.setItem('user', JSON.stringify({ username: this.username }));
            this.router.navigate(['/']);
          } else {
            alert('Error: ' + (data.status || 'Unknown error'));
          }
        },
        error: (error) => {
          console.error('Login error', error);
          alert('Login failed. Please check your credentials.');
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
