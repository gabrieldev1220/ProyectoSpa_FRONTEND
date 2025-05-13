import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';

@Component({
  selector: 'app-admin-reservas',
  standalone: false,
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.scss']
})
export class AdminReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  newReserva: any = { cliente: null, empleado: null, fechaReserva: '', servicio: '', status: 'PENDIENTE' };
  editingReserva: any = null;

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isGerenteGeneral()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadReservas();
    this.loadClientes();
    this.loadEmpleados();
  }

  loadReservas(): void {
    this.reservaService.getAllReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        if (data.length === 0) {
          this.toastr.info('No hay reservas registradas.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar las reservas.', 'Error');
        console.error('Error al cargar reservas:', error);
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los clientes.', 'Error');
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los empleados.', 'Error');
        console.error('Error al cargar empleados:', error);
      }
    });
  }

  createReserva(): void {
    const reservaData = {
      cliente: { id: this.newReserva.cliente },
      empleado: { id: this.newReserva.empleado },
      fechaReserva: this.newReserva.fechaReserva,
      servicio: this.newReserva.servicio,
      status: this.newReserva.status
    };
    this.reservaService.createReserva(reservaData).subscribe({
      next: () => {
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.loadReservas();
        this.newReserva = { cliente: null, empleado: null, fechaReserva: '', servicio: '', status: 'PENDIENTE' };
      },
      error: (error) => {
        this.toastr.error('Error al crear la reserva.', 'Error');
        console.error('Error al crear reserva:', error);
      }
    });
  }

  editReserva(reserva: Reserva): void {
    this.editingReserva = { ...reserva, cliente: reserva.cliente.id, empleado: reserva.empleado.id };
    // Abrir el modal usando Bootstrap
    const modalElement = document.getElementById('editReservaModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateReserva(): void {
    const reservaData = {
      id: this.editingReserva.id,
      cliente: { id: this.editingReserva.cliente },
      empleado: { id: this.editingReserva.empleado },
      fechaReserva: this.editingReserva.fechaReserva,
      servicio: this.editingReserva.servicio,
      status: this.editingReserva.status
    };
    this.reservaService.updateReserva(this.editingReserva.id, reservaData).subscribe({
      next: () => {
        this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
        this.loadReservas();
        this.editingReserva = null;
        // Cerrar el modal
        const modalElement = document.getElementById('editReservaModal') as HTMLElement;
        if (modalElement) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
          modalInstance.hide();
        }
      },
      error: (error) => {
        this.toastr.error('Error al actualizar la reserva.', 'Error');
        console.error('Error al actualizar reserva:', error);
      }
    });
  }

  deleteReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.deleteReserva(id).subscribe({
        next: () => {
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
          this.loadReservas();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar la reserva.', 'Error');
          console.error('Error al eliminar reserva:', error);
        }
      });
    }
  }
}