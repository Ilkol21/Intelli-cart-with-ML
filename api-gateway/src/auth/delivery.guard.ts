import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DeliveryGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user = context.switchToHttp().getRequest().user;
        if (user && (user.role === 'delivery' || user.role === 'admin')) {
            return true;
        }
        throw new ForbiddenException('Access restricted to delivery personnel.');
    }
}
