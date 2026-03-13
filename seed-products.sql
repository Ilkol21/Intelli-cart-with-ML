-- Seed script for catalog_db products table
-- Run with: docker exec -i intelli-cart-postgres-db-1 psql -U user -d catalog_db < seed-products.sql

INSERT INTO products (id, name, description, price, category, "imageUrl", store, "createdAt", "updatedAt")
VALUES
    -- Молочні продукти
    (gen_random_uuid(), 'Молоко 2.5%',       'Свіже пастеризоване молоко 1л',         28.50, 'Молочні продукти', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Кефір 1%',          'Кефір біфідо 900г',                      32.00, 'Молочні продукти', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Сметана 20%',       'Сметана фермерська 400г',                45.00, 'Молочні продукти', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Йогурт натуральний','Йогурт без добавок 500г',                38.00, 'Молочні продукти', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Сир кисломолочний', 'Домашній сир 250г',                      55.00, 'Молочні продукти', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Масло вершкове',    'Вершкове масло 82.5% 200г',              89.00, 'Молочні продукти', NULL, NULL, NOW(), NOW()),

    -- Хліб та випічка
    (gen_random_uuid(), 'Хліб білий',        'Батон нарізний 400г',                    22.00, 'Хліб та випічка',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Хліб чорний',       'Бородинський хліб 400г',                 24.00, 'Хліб та випічка',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Багет французький', 'Свіжий багет 250г',                       18.00, 'Хліб та випічка',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Круасан',           'Маслений круасан з начинкою',             15.00, 'Хліб та випічка',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Лаваш вірменський', 'Тонкий вірменський лаваш 250г',          19.00, 'Хліб та випічка',  NULL, NULL, NOW(), NOW()),

    -- М'ясо та птиця
    (gen_random_uuid(), 'Куряче філе',       'Охолоджене куряче філе 1кг',            129.00, 'М''ясо та птиця',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Свинячий фарш',     'Свіжий свинячий фарш 500г',              95.00, 'М''ясо та птиця',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Яловичина',         'Яловичина на кістці 1кг',               189.00, 'М''ясо та птиця',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Котлети курячі',    'Напівфабрикат курячі котлети 500г',      78.00, 'М''ясо та птиця',  NULL, NULL, NOW(), NOW()),

    -- Овочі та фрукти
    (gen_random_uuid(), 'Помідори',          'Свіжі помідори 1кг',                     55.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Огірки',            'Свіжі огірки 1кг',                       42.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Картопля',          'Молода картопля 1кг',                    25.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Яблука Голден',     'Яблука Голден 1кг',                      48.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Банани',            'Банани 1кг',                             52.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Морква',            'Морква 1кг',                             20.00, 'Овочі та фрукти',  NULL, NULL, NOW(), NOW()),

    -- Бакалія
    (gen_random_uuid(), 'Макарони Пенне',    'Макарони з твердих сортів пшениці 400г', 35.00, 'Бакалія',          NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Рис довгозернистий','Пропарений рис 1кг',                     62.00, 'Бакалія',          NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Гречка',            'Гречана крупа ядриця 1кг',               58.00, 'Бакалія',          NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Олія соняшникова',  'Рафінована соняшникова олія 1л',         72.00, 'Бакалія',          NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Цукор',             'Цукор білий 1кг',                        42.00, 'Бакалія',          NULL, NULL, NOW(), NOW()),

    -- Напої
    (gen_random_uuid(), 'Вода мінеральна',   'Мінеральна вода негазована 1.5л',        22.00, 'Напої',            NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Сік апельсиновий',  'Апельсиновий сік 1л',                    55.00, 'Напої',            NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Кола',              'Cola 1.5л',                               45.00, 'Напої',            NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), 'Чай зелений',       'Зелений чай листовий 100г',              89.00, 'Напої',            NULL, NULL, NOW(), NOW())

ON CONFLICT (name) DO NOTHING;

-- Перевірка результату
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;
