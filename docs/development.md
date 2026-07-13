# Development

## First setup

From the project root:

```powershell
docker compose up -d
```

Go to the web application:

```powershell
cd apps/web
```

Install dependencies:

```powershell
npm install
```

Generate Prisma Client:

```powershell
npx prisma generate
```

Apply migrations:

```powershell
npx prisma migrate dev
```

Seed the database:

```powershell
npx prisma db seed
```

Run the application:

```powershell
npm run dev
```

---

## After pulling changes

From the project root:

```powershell
git pull origin main
```

Go to the web application:

```powershell
cd apps/web
```

Generate Prisma Client:

```powershell
npx prisma generate
```

Apply pending migrations:

```powershell
npx prisma migrate dev
```

Run the seed (only if it changed):

```powershell
npx prisma db seed
```

Run the application:

```powershell
npm run dev
```

---

## Creating a new feature

From the project root:

```powershell
git switch main
git pull origin main
git branch -d feature/previous-branch
git fetch --prune
git switch -c feature/new-feature
```

---

## Before creating a Pull Request

From the web application:

```powershell
npm run lint
npm run build
```

From the project root:

```powershell
git status
git add .
git commit -m "type: description"
git push -u origin feature/branch-name
```

---

## Prisma

Generate Prisma Client:

```powershell
npx prisma generate
```

Create a migration:

```powershell
npx prisma migrate dev --name migration_name
```

Run pending migrations:

```powershell
npx prisma migrate dev
```

Run the seed:

```powershell
npx prisma db seed
```

Open Prisma Studio:

```powershell
npx prisma studio
```

---

## Docker

Start containers:

```powershell
docker compose up -d
```

Stop containers:

```powershell
docker compose down
```

List running containers:

```powershell
docker ps
```