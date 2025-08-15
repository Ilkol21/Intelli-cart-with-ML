// api-gateway/src/admin/admin.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard) // Спочатку перевіряємо токен, потім - чи адмін
@Controller('admin')
export class AdminController {
    private userServiceUrl = 'http://user-service-web/api/admin';
    private listServiceUrl = 'http://list-service:3000/admin';

    constructor(private readonly httpService: HttpService) {}

    @Get('stats/users')
    async getUserStats() {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.userServiceUrl}/stats/users`),
        );
        return data;
    }

    @Get('stats/lists')
    async getListStats() {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.listServiceUrl}/stats/lists`),
        );
        return data;
    }
}