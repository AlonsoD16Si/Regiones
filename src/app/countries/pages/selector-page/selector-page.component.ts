import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });


  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,//consumir servicio
  ) { }

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }
  //permite que los valores se detecten en los componentes hijos
  get regions(): Region[] {
    return this.countriesService.regions;
  }


  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.borders = []),
        switchMap((region) => this.countriesService.getCountriesByRegion(region)),
      )
      .subscribe(countries => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')!.setValue('')),
        filter((value: string) => value.length > 0), //filter() method that filters an array based on the given criteria or condition and returns a new array with only the elements that passed the condition given. The filter() method takes a callback that checks if a number is greater than 20 , and that returns true if the condition is satisfied.
        switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap((country) => this.countriesService.getCountryBordersByCodes(country.borders)),
      )
      .subscribe(countries => {
        this.borders = countries;
      });
  }


}
