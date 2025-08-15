// api-gateway/src/auth/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        if (user && user.role === 'admin') {
            return true;
        }

        throw new ForbiddenException('You do not have administrative privileges.');
    }
}