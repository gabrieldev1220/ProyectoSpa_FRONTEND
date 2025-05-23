import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { EmpleadoService } from '@core/services/empleado.service';
import { Reserva } from '@core/models/reserva';
import { Cliente } from '@core/models/cliente';
import { Empleado } from '@core/models/empleado';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  userType: string | null = null;
  reservas: Reserva[] = [];
  servicios: string[] = [];
  empleados: any[] = [];
  nuevaReserva: Reserva = {
    id: 0,
    cliente: {} as Cliente,
    empleado: {} as Empleado,
    fechaReserva: '',
    servicio: '',
    status: ''
  };

  selectedEmpleadoId: number | null = null;

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private empleadoService: EmpleadoService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getPrimaryRole();
    this.loadReservas();
    this.loadServicios();
    this.loadEmpleados();

    // Redirigir a /reserva solo si el usuario NO es GERENTE_GENERAL ni RECEPCIONISTA
    if (!this.authService.isGerenteGeneral() && !this.authService.isRecepcionista()) {
      this.router.navigate(['/reserva']);
    }
    return; // Salir de ngOnInit para evitar cargar datos innecesarios

    // Cargar lista de empleados solo si el usuario tiene el rol adecuado
    if (this.authService.isGerenteGeneral() || this.authService.isRecepcionista()) {
      this.empleadoService.getAllEmpleados().subscribe({
        next: (empleados) => {
          this.empleados = empleados;
          if (empleados.length > 0) {
            this.toastr.success('Lista de empleados cargada correctamente.', 'Éxito');
          } else {
            this.toastr.info('No hay empleados disponibles.', 'Información');
          }
        },
        error: (error) => {
          console.error('Error al cargar los empleados:', error);
          this.toastr.error(error.message || 'Error al cargar los empleados.', 'Error');
        }
      });
    }
  }

  loadReservas(): void {
    this.reservaService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        if (reservas.length > 0) {
          this.toastr.success('Reservas cargadas correctamente', 'Éxito'); // Mensaje de éxito
        } else {
          this.toastr.info('No tienes reservas actualmente', 'Información'); // Mensaje informativo
        }
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.toastr.error('Error al cargar tus reservas. Por favor, intenta de nuevo.', 'Error'); // Mensaje de error
      }
    });
  }

  loadServicios(): void {
    this.reservaService.getServiciosEnums().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
      },
      error: (error) => {
        console.error('Error al cargar los servicios:', error);
        this.toastr.error('Error al cargar los servicios: ' + (error.message || 'Por favor, intenta de nuevo.'));
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
        this.toastr.error('Error al cargar la lista de empleados: ' + (error.statusText || 
        error.message || 'Por favor, intenta de nuevo.'));
      }
    });
  }

  createReserva(): void {
    // Asegurarnos de que clienteId esté presente
    const clienteId = this.authService.getUserId();
    console.log('Cliente ID al intentar crear reserva:', clienteId);
    //console.log('Tipo de usuario:', this.authService.getTipoUsuario());
    console.log('Rol del usuario:', this.authService.getPrimaryRole());
    console.log('Token:', this.authService.getToken());

    if (!clienteId) {
      alert('Debes iniciar sesión para crear una reserva.');
      return;
    }

    // Validar que todos los campos requeridos estén presentes
    if (!this.nuevaReserva.servicio || !this.nuevaReserva.fechaReserva || !this.selectedEmpleadoId) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Crear el objeto Reserva en el formato que espera el backend
    const reservaData = {
      cliente: { id: clienteId },
      empleado: { id: this.selectedEmpleadoId },
      fechaReserva: this.nuevaReserva.fechaReserva,
      servicio: this.nuevaReserva.servicio,
      status: 'PENDIENTE'
    };
    
    console.log('Enviando datos de reserva:', reservaData);

    this.reservaService.createReserva(reservaData).subscribe({
      next: (response: any) => {
        // Mostrar mensaje de éxito usando toastr en lugar de alert
        this.toastr.success(response.message || 'Reserva creada exitosamente', 'Éxito');

        // Encontrar el empleado seleccionado para agregar su información completa
        const empleadoSeleccionado = this.empleados.find(emp => emp.id === this.selectedEmpleadoId);

        // Construir el objeto Cliente con solo el ID (simulamos las otras propiedades vacías ya que no las tenemos)
        const clienteSimulado: Cliente = {
          id: parseInt(clienteId, 10),
          dni: '',
          nombre: '',
          apellido: '',
          email: '',
          telefono: ''
        };

        // Agregar la nueva reserva al arreglo de reservas con la estructura completa de Reserva
        const nuevaReservaCompleta: Reserva = {
          id: response.data?.id || Date.now(), // Usamos un ID temporal si no hay response.data
          cliente: clienteSimulado,
          empleado: empleadoSeleccionado || {
            id: this.selectedEmpleadoId,
            dni: '',
            nombre: 'Desconocido',
            apellido: '',
            email: '',
            telefono: '',
            rol: ''
          },
          fechaReserva: this.nuevaReserva.fechaReserva,
          servicio: this.nuevaReserva.servicio,
          status: 'PENDIENTE'
        };
        this.reservas.push(nuevaReservaCompleta);

        // Limpiar el formulario
        this.nuevaReserva = {
          id: 0,
          cliente: { dni: '', nombre: '', apellido: '', email: '', telefono: '' } as Cliente,
          empleado: { dni: '', nombre: '', apellido: '', email: '', telefono: '', rol: '' } as Empleado,
          fechaReserva: '',
          servicio: '',
          status: ''
        };
        this.selectedEmpleadoId = null;
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.toastr.error(error.error?.message || 'Error al crear la reserva. Por favor, intenta de nuevo.');
      }
    });
  }
}