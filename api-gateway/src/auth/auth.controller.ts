// api-gateway/src/auth/auth.controller.ts
import { Controller, All, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    // --- ВИПРАВЛЕННЯ ТУТ ---
    // Звертаємось до нового веб-сервера, а не напряму до PHP
    private userServiceUrl = 'http://user-service-web/api/auth';

    constructor(private readonly httpService: HttpService) {}

    @All(':path')
    async proxy(@Req() req: Request) {
        const { method, body, params } = req;
        const url = `${this.userServiceUrl}/${params.path}`;

        try {
            const { data } = await firstValueFrom(
                this.httpService.request({
                    method,
                    url,
                    data: body,
                }),
            );
            return data;
        } catch (error: any) {
            throw new HttpException(
                error.response?.data || 'Internal server error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
