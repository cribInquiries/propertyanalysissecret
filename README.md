# LuxeAnalytics - Luxury Property Analysis Platform

A comprehensive Next.js application for analyzing luxury property investments, featuring revenue projections, maintenance breakdowns, setup costs, and value maximization strategies.

## Features

- **Property Analysis Dashboard**: Comprehensive analysis tools for luxury property investments
- **Revenue Projections**: Detailed financial forecasting and ROI calculations
- **Maintenance Breakdown**: Cost analysis for property upkeep and improvements
- **Setup Costs Calculator**: Initial investment and setup cost analysis
- **Value Maximization**: Strategies to maximize property value and returns
- **User Authentication**: Secure user accounts with Supabase integration
- **Data Management**: Local and cloud data storage with backup capabilities
- **Image Upload**: Property image management with Vercel Blob storage
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **File Storage**: Vercel Blob
- **Deployment**: Vercel
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and database)
- Vercel account (for deployment and file storage)

## How to Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd luxe-property-analysis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 4. Set up Supabase

1. Follow the detailed setup guide in `docs/supabase-setup.md`
2. Create a Supabase project and get your credentials
3. Run the database schema from `lib/supabase/schema.sql`

### 5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Build for production

```bash
npm run build
npm start
```

## How to Test

### Running Tests

This project uses Jest and React Testing Library for testing. To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Testing Components

```bash
# Test specific component
npm test -- PropertyAnalysisForm

# Test with verbose output
npm test -- --verbose
```

### Manual Testing

1. **Authentication Flow**:
   - Test user registration at `/auth/signup`
   - Test user login at `/auth/login`
   - Verify protected routes require authentication

2. **Property Analysis**:
   - Fill out the property analysis form
   - Verify data persistence in Supabase
   - Test image upload functionality

3. **Dashboard Features**:
   - Navigate through different analysis sections
   - Test data visualization components
   - Verify responsive design on different screen sizes

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx             # Feature-specific components
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── hooks/            # Custom React hooks
│   └── supabase/         # Supabase configuration
├── docs/                 # Documentation
└── public/               # Static assets
```

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Manual deployment
npx vercel --prod
```

### Environment Variables for Production

Ensure these are set in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BLOB_READ_WRITE_TOKEN`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the Supabase setup guide
- Open an issue on GitHub

## Roadmap

- [ ] Advanced analytics and reporting
- [ ] Property comparison tools
- [ ] Market trend analysis
- [ ] Investment portfolio management
- [ ] Mobile app development
