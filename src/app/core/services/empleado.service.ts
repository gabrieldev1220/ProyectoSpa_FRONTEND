import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Empleado } from '../models/empleado';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = `${environment.apiUrl}/api/empleados`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener la lista de empleados:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        let errorMessage = 'Error al cargar la lista de empleados. Por favor, intenta de nuevo más tarde.';
        if (error.status === 403) {
          errorMessage = 'No tienes permiso para acceder a la lista de empleados.';
        } else if (error.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, contacta al administrador.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getEmpleadoById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al obtener el empleado:', error);
        return throwError(() => new Error('Error al obtener el empleado. Por favor, intenta de nuevo más tarde.'));
      })
    );
  }

  createEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al crear el empleado:', error);
        return throwError(() => new Error('Error al crear el empleado. Por favor, intenta de nuevo más tarde.'));
      })
    );
  }

  updateEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar el empleado:', error);
        return throwError(() => new Error('Error al actualizar el empleado. Por favor, intenta de nuevo más tarde.'));
      })
    );
  }

  deleteEmpleado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al eliminar el empleado:', error);
        return throwError(() => new Error('Error al eliminar el empleado. Por favor, intenta de nuevo más tarde.'));
      })
    );
  }
}