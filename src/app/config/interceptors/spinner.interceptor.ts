import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from 'src/app/shared/services/spinner.service';

export const SpinnerInterceptor: HttpInterceptorFn = (req, next) => {
    const spinnerService = inject(SpinnerService);
    const showSpinner = req.headers.get('X-Show-Spinner') !== 'false';

    if (showSpinner) {
        spinnerService.show();
    }

    return next(req).pipe(
        finalize(() => {
            if (showSpinner) {
                spinnerService.hide();
            }
        })
    );
};
