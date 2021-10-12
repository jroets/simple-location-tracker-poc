import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LatLongComponent } from './lat-long.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [LatLongComponent],
  exports: [LatLongComponent]
})
export class LatLongComponentModule {}
