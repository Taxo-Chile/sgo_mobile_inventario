import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { GetTAGDetalleUseCase } from '../../../application/validacion/get-tag-detalle.usecase';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { ValidacionCaptura } from '../../../domain/validacion/models/validacion.model';
import { CrearTagModalComponent } from '../../../shared/components/crear-tag-modal/crear-tag-modal.component';
import { VALIDACION_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { ValidacionRepository } from '../../../domain/validacion/repositories/validacion.repository';

@Component({
  selector: 'app-tag-detail',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent],
  templateUrl: './tag-detail.page.html',
  styleUrls: ['./tag-detail.page.scss'],
})
export class TagDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private validacionState = inject(ValidacionState);
  private getTAGDetalle = inject(GetTAGDetalleUseCase);
  private notification = inject(NotificationService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private validacionRepo = inject<ValidacionRepository>(VALIDACION_REPOSITORY);

  agendaId = 0;
  validacionTAG = this.validacionState.validacionTAG;
  capturas = this.validacionState.capturas;
  loading = this.validacionState.loading;
  totalPendientes = this.validacionState.totalPendientes;
  totalConfirmadas = this.validacionState.totalConfirmadas;
  totalModificadas = this.validacionState.totalModificadas;
  puedeConfirmar = this.validacionState.puedeConfirmar;
  esFinalizado = computed(() => this.validacionTAG()?.tag?.estado_tag === 'FINALIZADO');
  esAnulado = computed(() => this.validacionTAG()?.tag?.estado_tag === 'ANULADO');

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('agendaId'));
    const tagId = Number(this.route.snapshot.paramMap.get('tagId'));
    if (!this.agendaId || !tagId) {
      this.router.navigate(['/home']);
      return;
    }

    this.getTAGDetalle.execute(this.agendaId, tagId).subscribe({
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  openCapture(captura: ValidacionCaptura) {
    if (this.esFinalizado()) return;
    const tagId = this.validacionTAG()?.tag?.id_tag;
    if (tagId) {
      this.router.navigate(['/agenda', this.agendaId, 'tag', tagId, 'capture', captura.id_conteo_det_c1]);
    }
  }

  async confirmarTAG() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar TAG',
      message: `Desea cerrar el TAG ${tag.numero_tag}? El TAG pasara a estado FINALIZADO y no podra recibir mas validaciones.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          cssClass: 'primary',
          handler: () => this.cerrarTAG(),
        },
      ],
    });
    await alert.present();
  }

  private cerrarTAG() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    this.validacionRepo.cerrarTAG(tag.id_tag).subscribe({
      next: (result) => {
        this.notification.success(`TAG ${result.numero_tag} cerrado correctamente`);
        this.refrescarTAG();
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al cerrar TAG');
      },
    });
  }

  goBack() {
    this.router.navigate(['/agenda', this.agendaId]);
  }

  openIncorporar() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;
    this.router.navigate(['/agenda', this.agendaId, 'tag', tag.id_tag, 'incorporar']);
  }

  async confirmarReactivar() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    const alert = await this.alertCtrl.create({
      header: 'Reactivar TAG',
      message: `Desea reactivar el TAG ${tag.numero_tag}? El TAG volvera a estado ABIERTO.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reactivar',
          handler: () => this.reactivarTAG(),
        },
      ],
    });
    await alert.present();
  }

  private reactivarTAG() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    this.validacionRepo.reactivarTAG(tag.id_tag).subscribe({
      next: (result) => {
        this.notification.success(`TAG ${result.numero_tag} reactivado correctamente`);
        this.refrescarTAG();
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al reactivar TAG');
      },
    });
  }

  async confirmarAnular() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    const alert = await this.alertCtrl.create({
      header: 'Anular TAG',
      message: `Desea anular el TAG ${tag.numero_tag}? El TAG pasara a estado ANULADO y no participara en conteos.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Anular',
          cssClass: 'danger',
          handler: () => this.anularTAG(),
        },
      ],
    });
    await alert.present();
  }

  private anularTAG() {
    const tag = this.validacionTAG()?.tag;
    if (!tag) return;

    this.validacionRepo.anularTAG(tag.id_tag).subscribe({
      next: (result) => {
        this.notification.success(`TAG ${result.numero_tag} anulado correctamente`);
        this.refrescarTAG();
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al anular TAG');
      },
    });
  }

  async abrirCrearTAG() {
    const modal = await this.modalCtrl.create({
      component: CrearTagModalComponent,
      componentProps: {},
      cssClass: 'crear-tag-modal',
      backdropDismiss: true,
    });
    modal.setAttribute('aria-label', 'Crear TAG nuevo');

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.crearTAG(data.numero_tag, data.id_tipo_ubicacion);
    }
  }

  private crearTAG(numeroTag: number, idTipoUbicacion: number) {
    this.validacionRepo.crearTAG(this.agendaId, numeroTag, idTipoUbicacion).subscribe({
      next: (result) => {
        this.notification.success(`TAG ${result.numero_tag} creado en zona: ${result.descripcion_zona}`);
        this.refrescarTAG();
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al crear TAG');
      },
    });
  }

  private refrescarTAG() {
    const tagId = Number(this.route.snapshot.paramMap.get('tagId'));
    if (tagId) {
      this.getTAGDetalle.execute(this.agendaId, tagId).subscribe();
    }
  }
}
