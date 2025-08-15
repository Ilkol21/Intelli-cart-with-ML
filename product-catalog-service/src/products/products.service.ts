// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ProductsService {
    private readonly mealApiUrl = 'https://www.themealdb.com/api/json/v1/1/search.php';

    constructor(private readonly httpService: HttpService) {}

    // Знаходить товар за назвою, роблячи запит до TheMealDB
    async findPriceByName(name: string): Promise<{ price: number; store: string } | null> {
        try {
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.get(this.mealApiUrl, { params: { s: name } }),
            );

            // Якщо API знайшло страву
            if (response.data && response.data.meals) {
                const meal = response.data.meals[0];
                // Імітуємо ціну на основі ID страви для стабільності
                const price = (parseInt(meal.idMeal) % 200) + 50.5; // Генеруємо ціну від 50.5 до 250.5

                return {
                    price: parseFloat(price.toFixed(2)),
                    store: 'TheMealDB Supermarket',
                };
            }

            return null;
        } catch (error) {
            console.error(`Failed to fetch price for ${name}:`, error);
            return null;
        }
    }
}