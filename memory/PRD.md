# KickOracle — Football Predictions Platform

## Original Problem Statement
Build a modern football prediction website with:
- Dark blue sports theme, Homepage hero, VIP games, Premium predictions, Fixed odds
- Results page, Contact page, WhatsApp float, Login/Signup
- Paystack payment integration for Ghana mobile money
- Unlock VIP games after successful payment
- Admin dashboard to post games
- Mobile responsive, beautiful football images, sticky nav, social footer
Stack: React + Tailwind + Node/FastAPI + MongoDB

## Architecture
- Backend: FastAPI (Python) on :8001, all routes `/api/*`
- Database: MongoDB (`football_predictions_db`)
- Frontend: React + Tailwind + Shadcn UI + framer-motion + react-fast-marquee + @phosphor-icons/react
- Auth: JWT (bcrypt password hashing)
- Payment: Paystack (placeholder keys; ready for real keys)

## User Personas
- **Punter**: signs up free, views Premium + Fixed Odds, upgrades to VIP for 50 GHS/month
- **VIP Member**: full access to all VIP picks for 30 days
- **Admin**: posts/edits/deletes games, manages users, reads contact messages

## Core Requirements (Static)
- Dark navy + electric lime "Luxury Performance Pro" theme
- Mobile-first responsive design
- Sticky glass-morphism navigation
- WhatsApp floating support button
- Ghana mobile money payment via Paystack

## What's Been Implemented (Feb 2026)
- Backend (`/app/backend/server.py`):
  - JWT auth (signup, login, me)
  - Games CRUD with role-based VIP locking (`vip`/`premium`/`fixed_odds` categories)
  - Results endpoint (won/lost games)
  - Admin endpoints (games CRUD, users list, stats, contact messages)
  - Paystack integration (initialize, verify, webhook) with placeholder-key guard
  - Auto-seeded admin user + 10 sample games on startup
  - Contact form submission
- Frontend (11 pages):
  - Home (hero + marquee + VIP/premium previews + CTA)
  - VIP (locked cards with unlock CTA, payment flow)
  - Premium, Fixed Odds (table), Results (with stats + filters)
  - Contact, Login, Signup, Account
  - Payment Callback (verify + activate VIP)
  - Admin Dashboard (stats, games table, post/edit form, users, messages)
- Testing: 21/21 backend tests pass, frontend e2e verified

## Default Credentials
- Admin: `admin@footballpredictions.com` / `Admin@123`
- VIP price: 50 GHS

## Prioritized Backlog (P0 → P2)
- P1: Replace placeholder Paystack keys with real test/live keys
- P1: Set real JWT_SECRET in production
- P1: Replace WhatsApp number (+233123456789) with real one
- P2: Email notifications on payment success (Resend/SendGrid)
- P2: Telegram/Discord bot for VIP picks delivery
- P2: Stripe/Flutterwave as additional payment options
- P2: Subscription tiers (Daily/Weekly/Monthly)
- P2: Affiliate program for referrals
- P2: Multi-language support (English/French/Twi)
- P3: Bet slip generator with one-click sportsbook handoff
