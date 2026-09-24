import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { ValidacionCaptura, IncorporarSKU } from '../../../domain/validacion/models/validacion.model';
import { VALIDACION_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { ValidacionRepository, ProductoBuscado } from '../../../domain/validacion/repositories/validacion.repository';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';

type ProductoEncontrado = ProductoBuscado;

@Component({
  selector: 'app-incorporar-sku',
  standalone: true,
  imports: [IonicModule, FormsModule, ConnectivityBannerComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="'/agenda/' + agendaId + '/tag/' + tagId" text="Volver"></ion-back-button>
        </ion-buttons>
        <ion-title>Incorporar SKU</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-connectivity-banner />

      <div class="page-inner">
        <div class="flex flex-col gap-2 mb-4">
          <h1 class="page-title">Incorporar SKU</h1>
          <p class="page-subtitle">Agrega un producto no detectado en la validación del TAG.</p>
        </div>

        <div class="flex flex-col gap-4">
          <!-- Buscar producto -->
          <div class="flex flex-col gap-2">
            <label class="field-label">Buscar SKU / Código de barras</label>
            <div class="flex gap-2">
              <ion-input
                class="input-base flex-1"
                type="text"
                inputmode="text"
                enterkeyhint="search"
                maxlength="15"
                placeholder="Ej: 9010696"
                [value]="busqueda()"
                (ionInput)="onBusquedaInput($event)"
                (keyup.enter)="buscarProducto()"
              ></ion-input>
              <ion-button class="btn-outline" fill="outline" (click)="buscarProducto()" [disabled]="buscando() || !busqueda().trim()">
                @if (buscando()) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon name="search-outline" slot="start"></ion-icon>
                  Buscar
                }
              </ion-button>
            </div>
            @if (busquedaError()) {
              <div class="error-pill">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ busquedaError() }}</span>
              </div>
            }
          </div>

          <!-- Resultados de búsqueda -->
          @if (productosEncontrados().length > 0) {
            <div class="flex flex-col gap-2">
              <span class="field-label">Seleccionar producto</span>
              <div class="flex flex-col gap-2" style="max-height: 240px; overflow-y: auto;">
                @for (prod of productosEncontrados(); track prod.id_producto) {
                  <button
                    type="button"
                    class="card p-3 text-left w-full"
                    style="cursor: pointer;"
                    [style.background]="productoSeleccionado()?.id_producto === prod.id_producto ? 'var(--app-success-bg)' : 'var(--app-surface)'"
                    [style.border-color]="productoSeleccionado()?.id_producto === prod.id_producto ? 'var(--app-success-border)' : 'var(--app-border)'"
                    (click)="seleccionarProducto(prod)"
                  >
                    <div class="font-bold" style="color: var(--app-text)">{{ prod.sku }}</div>
                    <div class="text-xs" style="color: var(--app-text-muted)">{{ prod.descripcion_producto }}</div>
                  </button>
                }
              </div>
            </div>
          }

          @if (productoSeleccionado()) {
            <div class="card p-3" style="background: var(--app-success-bg); border-color: var(--app-success-border);">
              <div class="text-xs mb-1" style="color: var(--app-text-muted)">Producto seleccionado:</div>
              <div class="font-bold" style="color: var(--app-text)">
                {{ productoSeleccionado()?.sku }} - {{ productoSeleccionado()?.descripcion_producto }}
              </div>
            </div>
          }

          <!-- Cantidad -->
          <div class="flex flex-col gap-2">
            <label class="field-label">Cantidad</label>
            <ion-input
              class="input-base"
              type="number"
              inputmode="numeric"
              enterkeyhint="next"
              min="0"
              placeholder="0"
              [value]="cantidad()"
              (ionInput)="onCantidadInput($event)"
            ></ion-input>
            @if (cantidadError()) {
              <div class="error-pill">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ cantidadError() }}</span>
              </div>
            }
          </div>

          <!-- Unidad de medida -->
          <div class="flex flex-col gap-2">
            <label class="field-label">Unidad de medida</label>
            <ion-select [(ngModel)]="unidadMedida" placeholder="Seleccionar" class="input-base" interface="popover">
              <ion-select-option value="UN">UN</ion-select-option>
              <ion-select-option value="BLS">BLS</ion-select-option>
              <ion-select-option value="KG">KG</ion-select-option>
              <ion-select-option value="LT">LT</ion-select-option>
              <ion-select-option value="M2">M2</ion-select-option>
              <ion-select-option value="ML">ML</ion-select-option>
            </ion-select>
          </div>

          <!-- Motivo -->
          <div class="flex flex-col gap-2">
            <label class="field-label">Motivo de incorporación</label>
            <ion-textarea
              class="input-base"
              placeholder="Ej: Producto no detectado en conteo PDA"
              [value]="motivo()"
              (ionInput)="onMotivoInput($event)"
              [autoGrow]="true"
              [rows]="3"
            ></ion-textarea>
            @if (motivoError()) {
              <div class="error-pill">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ motivoError() }}</span>
              </div>
            }
          </div>

          <ion-button
            class="btn-primary"
            expand="block"
            (click)="incorporar()"
            [disabled]="guardando()"
          >
            @if (guardando()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
              Guardando...
            } @else {
              <ion-icon name="add-circle-outline" slot="start"></ion-icon>
              Incorporar
            }
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class IncorporarSkuPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private validacionRepo = inject<ValidacionRepository>(VALIDACION_REPOSITORY);
  private validacionState = inject(ValidacionState);
  private notification = inject(NotificationService);

  agendaId = 0;
  tagId = 0;
  tagTipo = '';

  busqueda = signal('');
  buscando = signal(false);
  guardando = signal(false);
  productosEncontrados = signal<ProductoEncontrado[]>([]);
  productoSeleccionado = signal<ProductoEncontrado | null>(null);
  cantidad = signal<number | null>(null);
  unidadMedida = 'UN';
  motivo = signal('');
  busquedaError = signal('');
  cantidadError = signal('');
  motivoError = signal('');

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('agendaId'));
    this.tagId = Number(this.route.snapshot.paramMap.get('tagId'));
    if (!this.agendaId || !this.tagId) {
      this.router.navigate(['/home']);
    }
  }

  onBusquedaInput(event: CustomEvent<{ value?: string | null }>) {
    let value = event.detail.value ?? '';
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    this.busqueda.set(value);
    if (this.busquedaError()) this.busquedaError.set('');
  }

  onCantidadInput(event: CustomEvent<{ value?: string | number | null }>) {
    const raw = event.detail.value;
    const asString = raw === null || raw === undefined ? '' : String(raw).trim();
    const digits = asString.replace(/[^\d.]/g, '');
    if (digits.length > 7) {
      this.cantidad.set(Number(digits.slice(0, 7)));
      if (this.cantidadError()) this.cantidadError.set('');
      return;
    }
    this.cantidad.set(asString === '' || asString === '.' ? null : Number(digits));
    if (this.cantidadError()) this.cantidadError.set('');
  }

  onMotivoInput(event: CustomEvent<{ value?: string | null }>) {
    this.motivo.set(event.detail.value ?? '');
    if (this.motivoError()) this.motivoError.set('');
  }

  buscarProducto() {
    const q = this.busqueda().trim();
    this.busquedaError.set('');
    if (!q) {
      this.busquedaError.set('Ingresa un SKU o código de barras (máx. 15 caracteres)');
      return;
    }
    if (q.length > 15) {
      this.busquedaError.set('El SKU no puede superar 15 caracteres');
      return;
    }
    if (!this.agendaId) return;

    this.buscando.set(true);
    this.productosEncontrados.set([]);
    this.productoSeleccionado.set(null);

    this.validacionRepo.buscarProductos(this.agendaId, q).subscribe({
      next: (productos) => {
        this.productosEncontrados.set(productos);
        this.buscando.set(false);
        if (productos.length === 0) {
          this.busquedaError.set('No se encontraron productos para esa búsqueda');
        }
      },
      error: (err) => {
        this.buscando.set(false);
        this.busquedaError.set(err?.message || 'Error al buscar productos');
      },
    });
  }

  seleccionarProducto(prod: ProductoEncontrado) {
    this.productoSeleccionado.set(prod);
  }

  incorporar() {
    const prod = this.productoSeleccionado();
    this.cantidadError.set('');
    this.motivoError.set('');

    if (!prod) {
      this.busquedaError.set('Selecciona un producto de la lista');
      return;
    }
    const cantidad = this.cantidad();
    if (cantidad === null || Number.isNaN(cantidad) || cantidad <= 0) {
      this.cantidadError.set('Ingresa una cantidad válida (máx. 7 dígitos)');
      return;
    }
    if (!this.motivo().trim()) {
      this.motivoError.set('Ingresa un motivo de incorporación');
      return;
    }

    this.guardando.set(true);

    const data: IncorporarSKU = {
      agenda_id: this.agendaId,
      tag_id: this.tagId,
      id_producto: prod.id_producto,
      cantidad,
      motivo: this.motivo().trim(),
      login: 'APP_TABLET',
    };

    this.validacionRepo.incorporarSKU(data).subscribe({
      next: () => {
        const nuevaCaptura: ValidacionCaptura = {
          id_conteo_det_c1: Date.now(),
          id_producto: prod.id_producto,
          producto_nombre: prod.descripcion_producto,
          producto_sku: prod.sku,
          c1_cantidad: 0,
          c2_cantidad: cantidad,
          unidad_medida: this.unidadMedida,
          estado: 'MODIFICADA',
          motivo: `Incorporado: ${this.motivo().trim()}`,
          login_operador: 'APP_TABLET',
          fecha_captura: new Date().toISOString(),
        };
        this.validacionState.agregarCaptura(nuevaCaptura);
        this.guardando.set(false);
        this.notification.success('SKU incorporado correctamente');
        this.router.navigate(['/agenda', this.agendaId, 'tag', this.tagId]);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notification.error(err?.message || 'Error al incorporar SKU. Intente nuevamente.');
      },
    });
  }
}
