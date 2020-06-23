import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor
{
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(err => {
                if(err.status === 401) {
                    throwError(err.statusText);
                }
                if(err instanceof HttpErrorResponse){
                    const applicationError = err.headers.get("Application-Error");
                    if(applicationError){
                        return throwError(applicationError);
                    }
                    const serverError = err.error;
                    let modelStateErrors = '';
                    if(serverError.errors && typeof serverError.errors === 'object') {
                        for(const key in serverError.errors)
                        {
                            if(serverError.errors[key]){
                                modelStateErrors += serverError.errors[key] + '\n';
                            }
                        }
                    }
                    return throwError(modelStateErrors || serverError || 'Server Error');
                }

            })
        )
    }
}
export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
}