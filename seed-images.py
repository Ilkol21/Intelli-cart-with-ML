#!/usr/bin/env python3
"""
Завантажує зображення для товарів і оновлює базу даних.
Запуск: python3 seed-images.py
"""
import subprocess
import os
import time
import urllib.request
import urllib.error

# Маппінг: назва товару -> ключові слова для пошуку фото
PRODUCT_IMAGES = {
    "Молоко 2.5%":          "milk,dairy",
    "Кефір 1%":             "kefir,yogurt,dairy",
    "Сметана 20%":          "sour+cream,dairy",
    "Йогурт натуральний":   "yogurt,dairy",
    "Сир кисломолочний":    "cottage+cheese,dairy",
    "Масло вершкове":       "butter,dairy",

    "Хліб білий":           "white+bread,bakery",
    "Хліб чорний":          "rye+bread,bakery",
    "Багет французький":    "baguette,bread",
    "Круасан":              "croissant,pastry",
    "Лаваш вірменський":    "flatbread,lavash",

    "Куряче філе":          "chicken+breast,meat",
    "Свинячий фарш":        "minced+meat,pork",
    "Яловичина":            "beef,meat",
    "Котлети курячі":       "chicken+cutlet,meat",

    "Помідори":             "tomatoes,vegetables",
    "Огірки":               "cucumbers,vegetables",
    "Картопля":             "potatoes,vegetables",
    "Яблука Голден":        "golden+apples,fruit",
    "Банани":               "bananas,fruit",
    "Морква":               "carrots,vegetables",

    "Макарони Пенне":       "pasta,penne",
    "Рис довгозернистий":   "rice,grains",
    "Гречка":               "buckwheat,grains",
    "Олія соняшникова":     "sunflower+oil,cooking",
    "Цукор":                "sugar,food",

    "Вода мінеральна":      "mineral+water,drink",
    "Сік апельсиновий":     "orange+juice,drink",
    "Кола":                 "cola,soda,drink",
    "Чай зелений":          "green+tea,drink",
}


def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode


def download_image(keywords, filepath):
    """Завантажує фото через loremflickr.com."""
    url = f"https://loremflickr.com/400/400/{keywords}/all"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        return True
    except Exception as e:
        print(f"     ⚠️  Помилка завантаження ({keywords}): {e}")
        return False


def main():
    print("=== Завантаження зображень для товарів ===\n")

    # 1. Отримуємо список товарів з БД
    sql = "SELECT id, name FROM products WHERE name != '123';"
    out, code = run(f'docker exec postgres-db psql -U user catalog_db -t -A -F"|" -c "{sql}"')
    if code != 0:
        print("❌ Не вдалося підключитись до бази даних. Перевір чи запущений docker compose.")
        return

    products = []
    for line in out.strip().splitlines():
        if "|" in line:
            pid, name = line.split("|", 1)
            products.append((pid.strip(), name.strip()))

    print(f"Знайдено {len(products)} товарів\n")

    # 2. Завантажуємо зображення і копіюємо в контейнер
    tmp_dir = "/tmp/product_images"
    os.makedirs(tmp_dir, exist_ok=True)

    success = 0
    for pid, name in products:
        keywords = PRODUCT_IMAGES.get(name)
        if not keywords:
            print(f"  ⏭  {name} — немає ключових слів, пропускаємо")
            continue

        filename = f"{pid}.jpg"
        filepath = os.path.join(tmp_dir, filename)

        print(f"  ⬇️  {name} ({keywords})...", end=" ", flush=True)

        if download_image(keywords, filepath):
            # Копіюємо у контейнер
            _, cp_code = run(f"docker cp {filepath} product-catalog-service:/usr/src/app/uploads/{filename}")
            if cp_code == 0:
                # Оновлюємо БД
                image_url = f"/uploads/{filename}"
                run(f"""docker exec postgres-db psql -U user catalog_db -c "UPDATE products SET \\"imageUrl\\"='{image_url}' WHERE id='{pid}';" """)
                print(f"✅ OK")
                success += 1
            else:
                print(f"❌ Не вдалося скопіювати в контейнер")

        # Невелика пауза щоб не спамити API
        time.sleep(0.5)

    print(f"\n=== Готово: {success}/{len([p for p in products if p[1] in PRODUCT_IMAGES])} зображень завантажено ===")
    print("Оновіть сторінку в браузері щоб побачити зміни.")


if __name__ == "__main__":
    main()
