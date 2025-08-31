# FAQ Platform

A powerful platform for creating and managing customizable FAQ sites with ease.

## Features

- 📝 Create and manage multiple FAQ sites
- 🎨 Customizable design themes
- 🔍 SEO-friendly structure
- 📱 Responsive design
- 🔐 Authentication system using Supabase
- ⚡ High performance with Next.js

## Tech Stack

- **Frontend**

  - Next.js 13.5.1
  - React 18.2.0
  - TypeScript
  - TailwindCSS
  - Radix UI Components
  - Framer Motion

- **Backend**
  - Supabase
  - PostgreSQL

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account

## Getting Started

1. Clone the repository

```bash
git clone [repository-url]
cd faq-platform
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server

```bash
npm run dev
```

## Usage

1. Create an account or log in
2. Create a new FAQ site from the dashboard
3. Add and edit FAQs
4. Customize the theme
5. Get the public URL for your FAQ site

## Key Components

- **Authentication**: Secure user authentication powered by Supabase
- **Dashboard**: Intuitive interface for managing FAQ sites
- **Theme Customizer**: Visual editor for customizing site appearance
- **FAQ Editor**: Rich text editor for creating and organizing FAQs
- **Dynamic Routing**: Custom domains for each FAQ site

## Deployment

We recommend deploying this project on Vercel:

1. Create a Vercel account
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Project Structure

```
faq-platform/
├── app/                 # Next.js app directory
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   └── ui/            # UI components
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── supabase/         # Supabase configurations and migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

If you have any questions or run into issues, please open an issue in the GitHub repository.
