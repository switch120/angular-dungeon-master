import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  @ViewChild("mapContainer") mapContainer:ElementRef;
  @ViewChild("streetsContainer") streetsContainer:ElementRef;
  
  public title = 'angular-street-quiz';
  public lat: number;
  public lng: number;
  public zoom: number = 14;
  private zoom_touched:boolean = false;
  public selectedStreet: string;
  
  public streets:any[] = [];
  public search:string;
  public quizStreet:string;

  // allow the app to auto-update street entries when matched data returns from the geocoder
  public autoUpdate:boolean = false;

  public _quizMode:boolean = false;

  public get quizMode():boolean {
    return this._quizMode;
  };

  public set quizMode(value:boolean) {
    this._quizMode = value;
    if (value) this.generateQuizStreet();
  };

  public get filteredStreets():string[] {
    if (this.quizMode) return [];
    
    return this.streets.filter(elem => {
      return this.search ? elem.toLowerCase().indexOf(this.search.toLowerCase()) > -1 : true;
    });
  }

  public get mapHeight():number {
    if (this.mapContainer.nativeElement.offsetParent.offsetTop < 20) return window.innerHeight;
    return window.innerHeight - this.mapContainer.nativeElement.offsetParent.offsetTop;
  }

  public get streetsHeight():number {
    if (this.mapContainer.nativeElement.offsetParent.offsetTop < 20) return this.mapHeight - this.streetsContainer.nativeElement.offsetTop - 15;
    return (window.innerHeight / 2) - this.streetsContainer.nativeElement.offsetTop - 15;
  }

  constructor(
    private http:HttpClient,
    private db:AngularFireDatabase,
    public ref:ChangeDetectorRef
  ) {    
    // subscribe to the streets collection
    this.db.list("/streets").valueChanges().subscribe( (data:any) => {

      // reset array
      this.streets = data.sort();
      
      this.refreshMap();
    });
  }

  setStreet(value)
  {
    if (!this.zoom_touched) {
      this.zoom = 17;
      this.zoom_touched = true;
    }
    
    this.selectedStreet = value;
    this.refreshMap();
  }

  refreshMap()
  {
    let addr = this.selectedStreet || environment.starting_address;
    this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}+${environment.base_zip}&key=${environment.googlemaps.api_key}`).subscribe((data:any) => {
    
      if (data.results.length)
      {
        let first = data.results[0];

        this.lat = first.geometry.location.lat;
        this.lng = first.geometry.location.lng;

        let matchedAddr = first.address_components[0];

        // update the stored name if the matched returned address contains our search and it's not the same
        if (this.selectedStreet && this.autoUpdate && matchedAddr.short_name && matchedAddr.short_name != addr && matchedAddr.short_name.toLowerCase().indexOf(addr.toLowerCase()) != -1)
        {
          let idx = this.streets.indexOf(addr);

          if (idx < 0) return;
          
          // send the whole array even though it's deprecated ... dealing with missing indexes is a goddamn nightmare
          this.streets[idx] = matchedAddr.short_name;
          this.db.object("/streets").update(this.streets);

          // TODO : FitBounds to get whole road in view (auto-zoom)
        }
      }

      window.scrollTo(0,0);
    });
  }

  generateQuizStreet()
  {
    this.quizStreet = this.streets[Math.round(Math.random() * this.streets.length)];
  }

}
