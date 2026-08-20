export class Driver {
    _id: string;
    driver_name: string;
    driver_department: string;
    driver_licence: string;
    driver_isActive: boolean;
    driver_id: string;
    driver_packages: any;
    driver_audio: string | null;

    constructor(
        _id: string = '',
        driver_name: string = '',
        driver_department: string = '',
        driver_licence: string = '',
        driver_isActive: boolean = false,
        driver_id: string = '',
        driver_packages: any = '',
        driver_audio: string | null = null
    ) {
        this._id = _id;
        this.driver_name = driver_name;
        this.driver_department = driver_department;
        this.driver_licence = driver_licence;
        this.driver_isActive = driver_isActive;
        this.driver_id = driver_id;
        this.driver_packages = driver_packages;
        this.driver_audio = driver_audio;
    }
}