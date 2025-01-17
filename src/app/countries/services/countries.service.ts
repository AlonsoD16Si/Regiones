import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [ ...this._regions ];//para romper la relacion con las regiones
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {
    if ( !region ) return of([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({// map: toma la response que en este caso es "countries" 
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      )
  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry> {
    const url = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;
    return this.http.get<Country>( url )
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([]); //arreglo de bordes

    const countriesRequests:Observable<SmallCountry>[]  = []; //coleccion de observables

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request );
    });


    return combineLatest( countriesRequests );//se manda el conjunto de observables
  }


}
