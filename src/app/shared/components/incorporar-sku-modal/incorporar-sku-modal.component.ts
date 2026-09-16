import { Component, inject, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValidacionCaptura } from '../../../domain/validacion/models/validacion.model';

@Component({
  selector: 'app-incorporar-sku-modal',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Incorporar SKU</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">SKU / Código de barras</label>
          <ion-input
            [(ngModel)]="sku"
            placeholder="Ej: 9010696"
            type="text"
            class="input-tablet"
          ></ion-input>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Nombre del producto</label>
          <ion-input
            [(ngModel)]="nombre"
            placeholder="Ej: RODILLERA BAUKER"
            type="text"
            class="input-tablet"
          ></ion-input>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Cantidad</label>
          <ion-input
            [(ngModel)]="cantidad"
            placeholder="0"
            type="number"
            class="input-tablet"
          ></ion-input>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Unidad de medida</label>
          <ion-select [(ngModel)]="unidadMedida" placeholder="Seleccionar" class="input-tablet">
            <ion-select-option value="UN">UN</ion-select-option>
            <ion-select-option value="BLS">BLS</ion-select-option>
            <ion-select-option value="KG">KG</ion-select-option>
            <ion-select-option value="LT">LT</ion-select-option>
            <ion-select-option value="M2">M2</ion-select-option>
            <ion-select-option value="ML">ML</ion-select-option>
          </ion-select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium" style="color: var(--app-text)">Motivo de incorporación</label>
          <ion-textarea
            [(ngModel)]="motivo"
            placeholder="Ej: Producto no detectado en conteo PDA"
            rows="3"
            class="input-tablet"
          ></ion-textarea>
        </div>

        <ion-button
          class="btn-primary"
          expand="block"
          (click)="incorporar()"
          [disabled]="!sku()?.trim() || !nombre()?.trim() || !cantidad() || cantidad()! <= 0 || !motivo()?.trim()"
        >
          <ion-icon name="add-circle-outline" slot="start"></ion-icon>
          Incorporar
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class IncorporarSkuModalComponent {
  private modalCtrl = inject(ModalController);

  tagId = 0;
  tagTipo = '';

  sku = signal('');
  nombre = signal('');
  cantidad = signal<number | null>(null);
  unidadMedida = signal('UN');
  motivo = signal('');

  incorporar() {
    const tagId = this.tagId;
    const nuevaCaptura: ValidacionCaptura = {
      id_conteo_det_c1: Date.now(),
      id_producto: Date.now(),
      producto_nombre: this.nombre(),
      producto_sku: this.sku(),
      c1_cantidad: 0,
      c2_cantidad: this.cantidad(),
      unidad_medida: this.unidadMedida(),
      estado: 'MODIFICADA',
      motivo: `Incorporado: ${this.motivo()}`,
      login_operador: 'incorporar',
      fecha_captura: new Date().toISOString(),
    };

    this.modalCtrl.dismiss(nuevaCaptura);
  }

  close() {
    this.modalCtrl.dismiss(null);
  }
}
