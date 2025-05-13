import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '@core/services/empleado.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Empleado } from '@core/models/empleado';

@Component({
  selector: 'app-admin-empleados',
  standalone: false,
  templateUrl: './admin-empleados.component.html',
  styleUrls: ['./admin-empleados.component.scss']
})
export class AdminEmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  newEmpleado: Empleado = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '', rol: 'TERAPEUTA' };
  editingEmpleado: Empleado | null = null;

  constructor(
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
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getAllEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        if (data.length === 0) {
          this.toastr.info('No hay empleados registrados.', 'Información');
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al cargar los empleados.', 'Error');
        console.error('Error al cargar empleados:', error);
      }
    });
  }

  createEmpleado(): void {
    this.empleadoService.createEmpleado(this.newEmpleado).subscribe({
      next: () => {
        this.toastr.success('Empleado creado exitosamente.', 'Éxito');
        this.loadEmpleados();
        this.newEmpleado = { dni: '', nombre: '', apellido: '', email: '', password: '', telefono: '', rol: 'TERAPEUTA' };
      },
      error: (error) => {
        this.toastr.error('Error al crear el empleado.', 'Error');
        console.error('Error al crear empleado:', error);
      }
    });
  }

  editEmpleado(empleado: Empleado): void {
    this.editingEmpleado = { ...empleado };
    // Abrir el modal usando Bootstrap
    const modalElement = document.getElementById('editEmpleadoModal') as HTMLElement;
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  updateEmpleado(): void {
    if (this.editingEmpleado) {
      this.empleadoService.updateEmpleado(this.editingEmpleado.id!, this.editingEmpleado).subscribe({
        next: () => {
          this.toastr.success('Empleado actualizado exitosamente.', 'Éxito');
          this.loadEmpleados();
          this.editingEmpleado = null;
          // Cerrar el modal
          const modalElement = document.getElementById('editEmpleadoModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
          }
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el empleado.', 'Error');
          console.error('Error al actualizar empleado:', error);
        }
      });
    }
  }

  deleteEmpleado(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      this.empleadoService.deleteEmpleado(id).subscribe({
        next: () => {
          this.toastr.success('Empleado eliminado exitosamente.', 'Éxito');
          this.loadEmpleados();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar el empleado.', 'Error');
          console.error('Error al eliminar empleado:', error);
        }
      });
    }
  }
}