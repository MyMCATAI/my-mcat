
# MYMCAT MVP

Created by Joshua Wade

WIP deployed at
https://my-mcatmy-mcat.vercel.app/

## Getting Started - Dev

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



# Notes

- Shadcn framework 
- folders and url structure
- clerk auth setup
- PlanetScale prisma MySQL DB

## Current Services
Services
- AI LLM - https://openai.com/
- Customer service - app.crisp.chat
- sql db - app.planetscale.com
- auth - dashboard.clerk.com

Backend DB
- prisma and planetscale
- run prisma with `npx prisma studio`
- run prisma db changes with `npx prisma generate`, `npx prisma db push `
- reset with `npx prisma migrate reset`

Stripe
- stripe login
- stripe listen --forward-to localhost:4242/webhook

run 
`stripe listen --forward-to localhost:3000/api/webhook`




Customer Support
- Crisp Chat -> methodAI email setup app.crisp.chat


# Prisma DB

Initial setup (optional)
```
npm i @prisma/client
npx prisma init
```

pushing changes

```
npx prisma db push
npx prisma generate
```

See data

```npx prisma studio```

### Running scripts

```
npm run "script-name"
```


### Todo
- Set up AWS for image storage
- Implement detailed weakness and calendar algos

