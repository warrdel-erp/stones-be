1. clone repo
2. run

```
pnpm install
```

3. put following env and put values accordingly.

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=rootroot
DB_NAME=stone_erp
DB_PORT=3306
PORT=5002
JWT_SECRET=123456
```

5. uncomment line:45 at src/index.ts

```
    // syncModels();
```

6. and run

```
pnpm run dev
```

7. **_Comment-out again the uncommented sync models line_**

8. ru

```
pnpm run seed:all
```

9. Checkout Postman collection inside `/docs`
