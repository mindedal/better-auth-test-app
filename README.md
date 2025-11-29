# BetterAuth Test App

This project serves as a comprehensive example and testing ground for a robust user authentication and authorization system, built with Next.js, React, and TypeScript. It leverages the `better-auth` library to provide a secure and feature-rich authentication experience, integrated with a PostgreSQL database via Prisma ORM and Upstash Redis for caching and rate limiting.

## Features

*   **Comprehensive User Authentication:** Secure email and password-based login and registration.
*   **Two-Factor Authentication (2FA):** Seamless integration and management of 2FA for enhanced account security.
*   **User Management:** Functionalities for user registration, login, and profile management, including email verification.
*   **Session Management:** Advanced handling of user sessions, with a dedicated session manager component.
*   **Role-Based Access Control (RBAC):** Foundation for assigning and managing user roles.
*   **Rate Limiting:** Protects against abuse and ensures system stability and responsiveness.
*   **Modern User Interface:** A polished and responsive UI built with Radix UI and styled using Tailwind CSS.
*   **Scalable Architecture:** Utilizes PostgreSQL with Prisma and Redis for efficient and performant data handling.
*   **Centralized Authentication API:** A single Next.js API route (`/api/auth/[...all]/route.ts`) for all authentication interactions.
*   **Dedicated User Flows:** Includes specific pages for login, registration, and a protected user dashboard.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS, Radix UI
*   **Authentication:** `better-auth` library
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Caching/Rate Limiting:** Upstash Redis
*   **Icons:** Lucide React
*   **Notifications:** Sonner
*   **Form Management:** React Hook Form, Zod
*   **2FA QR Codes:** `qrcode.react`

## Installation

To get the project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mindedal/better-auth-test-app.git
    cd better-auth-test-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Copy the `.env.example` file to `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` and fill in the required values. Ensure you have a PostgreSQL database and an Upstash Redis instance configured.

4.  **Migrate the database:**
    Once your `DATABASE_URL` is configured in `.env.local`, apply the Prisma migrations:
    ```bash
    npx prisma db push
    ```

## Usage

To start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

*   Access the login page at `/login`.
*   After successful authentication, you will be redirected to the dashboard at `/dashboard`.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue. For direct contributions, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.