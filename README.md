# @rebackk/pocketbase-adapter

[![npm version](https://badge.fury.io/js/%40rebackk%2Fpocketbase-adapter.svg)](https://www.npmjs.com/package/@rebackk/pocketbase-adapter)
[![License](https://img.shields.io/npm/l/@rebackk/pocketbase-adapter)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/rebackk/pocketbase-adapter/ci.yml)](https://github.com/rebackk/pocketbase-adapter/actions)

## Overview

`@rebackk/pocketbase-adapter` is an adapter that integrates [PocketBase](https://pocketbase.io) with [NextAuth.js](https://next-auth.js.org) for authentication, enabling seamless user management and session handling using PocketBase's collections and features.

## Pocketbase Setup
The Schema Used By Us For The Project is Mentioned [Here](https://github.com/Rebackk-Team/pocketbase-adapter/blob/main/pocketbase/schema.json)
> PS : Setup Roles According To Your Needs

## Features

- Full integration with NextAuth.js for authentication workflows.
- Supports PocketBase collections like `users`, `accounts`, `sessions`, `authenticators`, and `verification tokens`.
- Fully type-safe schema, leveraging TypeScript.
- Supports various authentication strategies, including OAuth.

## Installation

You can install the package via npm or yarn.

```bash
npm install @rebackk/pocketbase-adapter
```

or

```bash
yarn add @rebackk/pocketbase-adapter
```

or

```bash
pnpm add @rebackk/pocketbase-adapter
```

## Usage

Here’s how to integrate the adapter into your NextAuth.js configuration.

### Step 1: Add the adapter

In your `app/api/[...next-auth]/route.ts` (or `.js`) file, add the PocketBase adapter:

```ts
import NextAuth from "next-auth";
import { PocketBaseAdapter } from "@rebackk/pocketbase-adapter";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090"); // Your PocketBase instance URL

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // Add your OAuth or other providers here
  ],
  adapter: PocketBaseAdapter(pb),
});
```

### Step 2: Configure PocketBase Schema

Ensure you have the following collections in your PocketBase instance:

1. **Users**: Default PocketBase users collection.
2. **Accounts**: For linking users with their OAuth or credentials.
3. **Sessions**: To manage user sessions.
4. **Authenticators**: To handle multi-factor authentication (MFA).
5. **VerificationTokens**: For managing email verification flows.

### Step 3: Customize NextAuth.js

Configure any additional settings in the NextAuth.js config as required. You can leverage the full feature set of NextAuth.js, including JWT, OAuth, and more.

```ts
export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    // Add your providers here
  ],
  adapter: PocketBaseAdapter(pb),
  secret: process.env.NEXTAUTH_SECRET,
});
```

## Environment Variables

To secure your app, ensure that you have the following environment variables set up:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

## Testing

This package is fully tested using [node tests](https://nodejs.org/api/test.html). To run tests, execute:

```bash
npm run test
```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a pull request.

Please ensure that you write tests for any new features or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Rebackk](https://rebackk.xyz).
