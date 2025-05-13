import { Component, OnInit } from '@angular/core';
import { ReservaService } from '@core/services/reserva.service';
import { ClienteService } from '@core/services/cliente.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: false,
  templateUrl: './recepcionista-dashboard.component.html',
  styleUrls: ['./recepcionista-dashboard.component.scss']
})
export class RecepcionistaDashboardComponent implements OnInit {
  reservas: Reserva[] = [];
  clientes: Cliente[] = [];
  empleados: Empleado[] = [];
  newReserva: Reserva = {
    id: 0,
    cliente: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', password: '' },
    empleado: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', rol: '' },
    fechaReserva: '',
    servicio: '',
    status: 'PENDIENTE'
  };
  editingReserva: Reserva | null = null;


  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
    this.loadClientes();
    this.loadEmpleados();
  }

  loadReservas(): void {
    this.reservaService.getReservasForRecepcionista().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.toastr.error('Error al cargar las reservas. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Error al cargar los clientes:', error);
        this.toastr.error('Error al cargar los clientes.', 'Error');
      }
    });
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
      },
      error: (error) => {
        console.error('Error al cargar los empleados:', error);
        this.toastr.error('Error al cargar los empleados.', 'Error');
      }
    });
  }

  createReserva(): void {
    const reservaToCreate = {
      ...this.newReserva,
      cliente: { id: this.newReserva.cliente.id },
      empleado: { id: this.newReserva.empleado.id }
    };
    this.reservaService.createReserva(reservaToCreate).subscribe({
      next: (newReserva) => {
        this.reservas.push(newReserva);
        this.toastr.success('Reserva creada exitosamente.', 'Éxito');
        this.resetNewReserva();
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.toastr.error('Error al crear la reserva. Por favor, intenta de nuevo.', 'Error');
      }
    });
  }

  editReserva(reserva: Reserva): void {
    this.editingReserva = { ...reserva };
  }

  updateReserva(): void {
    if (this.editingReserva) {
      const reservaToUpdate = {
        ...this.editingReserva,
        cliente: { id: this.editingReserva.cliente.id },
        empleado: { id: this.editingReserva.empleado.id }
      };
      this.reservaService.updateReserva(this.editingReserva.id, reservaToUpdate).subscribe({
        next: (updatedReserva) => {
          const index = this.reservas.findIndex(r => r.id === updatedReserva.id);
          if (index !== -1) {
            this.reservas[index] = updatedReserva;
          }
          this.editingReserva = null;
          this.toastr.success('Reserva actualizada exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al actualizar la reserva:', error);
          this.toastr.error('Error al actualizar la reserva.', 'Error');
        }
      });
    }
  }

  deleteReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.deleteReserva(id).subscribe({
        next: () => {
          this.reservas = this.reservas.filter(r => r.id !== id);
          this.toastr.success('Reserva eliminada exitosamente.', 'Éxito');
        },
        error: (error) => {
          console.error('Error al eliminar la reserva:', error);
          this.toastr.error('Error al eliminar la reserva.', 'Error');
        }
      });
    }
  }

  resetNewReserva(): void {
    this.newReserva = {
      id: 0,
      cliente: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', password: '' },
      empleado: { id: 0, nombre: '', apellido: '', email: '', dni: '', telefono: '', rol: '' },
      fechaReserva: '',
      servicio: '',
      status: 'PENDIENTE'
    };
  }
}
