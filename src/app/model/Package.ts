export class Package {
    _id: string;
    package_title: string;
    package_weight: number;
    package_destination: string;
    description: string;
    isAllocated: boolean;
    driver_id: string;
    result:{ description: string, languageChosen: string, translation: string }[];
    distance:string|null;

    constructor(
        _id: string = '',
        package_title: string = '',
        package_weight: number = 0,
        package_destination: string = '',
        description: string = '',
        isAllocated: boolean = false,
        driver_id: string = '',
        result: { description: string, languageChosen: string, translation: string }[] = [],
        distance:string|null=null
    ) {
        this._id = _id;
        this.package_title = package_title;
        this.package_weight = package_weight;
        this.package_destination = package_destination;
        this.description = description;
        this.isAllocated = isAllocated;
        this.driver_id = driver_id;
        this.result = result;
        this.distance=null;
    }
}