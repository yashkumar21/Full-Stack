import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const DRIVER_API_URL = '/32796021/api/v1/drivers';
const PACKAGE_API_URL = '/32796021/api/v1/packages';
const STATS_API_URL = '/32796021/Yash';
const USER_API_URL = '/32796021/api/v1/users';



const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  isauthenticated:boolean=false

  constructor(private http: HttpClient) { 
  }

  addDriver(driver:any){
    return this.http.post(DRIVER_API_URL + '/add', driver, httpOptions);
  }

  listDrivers(){
    return this.http.get(DRIVER_API_URL + '/');
  }

  deleteDriver(driverId: string) {
    return this.http.delete(DRIVER_API_URL + '/delete?id=' + driverId);
  }
  

  updateDriver(driverInfo: any) {
    return this.http.put(DRIVER_API_URL + '/update', driverInfo, httpOptions);
  }

  getPackage() {
    return this.http.get(PACKAGE_API_URL + '/');
  }

  addPackage(packages:any){
    return this.http.post(PACKAGE_API_URL + '/add', packages, httpOptions);
  }

  deletePackage(id:string){
    return this.http.delete(`${PACKAGE_API_URL}/delete/${id}`);
  }

  updatePackage(packageInfo: any) {
    return this.http.put(PACKAGE_API_URL + '/update', packageInfo, httpOptions);
  }  

  getStats() {
    return this.http.get(STATS_API_URL + '/stats');
  }

  loginUser(user:any){
    return this.http.post(USER_API_URL + '/login', user, httpOptions);
  }

  isAuthenticated(){
    return this.isauthenticated;
  }

  signupuser(user:any){
    return this.http.post(USER_API_URL + '/signup', user, httpOptions);
  }
  loginuser(user:any){
    return this.http.post(USER_API_URL + '/login', user, httpOptions);
  }
}