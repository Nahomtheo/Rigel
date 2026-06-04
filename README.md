# Ethiopia Marketplace - SecondP

A modern, production-ready marketplace platform optimized for Ethiopia, supporting cars, rentals, housing, and clothes.

## Features

### 🚗 Categories & Subcategories

#### Cars
- Sedan
- SUV
- Truck
- Motorcycle
- **Electric Vehicles** ⚡
- Hybrid

#### Rentals
- **Wedding Cars** 💒
- **Construction Vehicles** 🏗️
- **Business Vehicles** 💼
- Daily Rentals
- Luxury Rentals

#### Housing
- Apartments
- Houses
- Offices
- Land

#### Clothes
- Men's Clothing
- Women's Clothing
- Kids' Clothing
- Traditional Clothing
- Sports Wear

### 🔍 Search Optimization

- **Ethiopian Market Focus**: Optimized for Ethiopian regions, cities, and local search terms
- **Amharic Support**: Search works with both Amharic and English keywords
- **Location-Based**: Filter by region, city, subcity, woreda, and landmarks
- **Smart Keywords**: Auto-generated search keywords for better discoverability

### 📱 Mobile-First Design

- Fully responsive design
- Touch-friendly interfaces
- Optimized for low-bandwidth connections
- Progressive Web App ready

### 💎 Premium Features

#### For Premium Users:
- Phone numbers visible to all users
- Priority listing placement
- Premium badge on profile
- View contact details of other premium users
- Unlimited listings per month

#### Phone Visibility Control:
- Users can choose to show phone to all users
- Or restrict to premium users only
- Setting can be changed anytime in dashboard

### 🔐 User Authentication

- Email/Password signup
- Google OAuth
- Facebook OAuth
- Phone number verification
- Two-factor authentication ready

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Storage**: Cloudinary

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd secondp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── listings/          # Listing CRUD operations
│   ├── search/            # Search functionality
│   └── premium/           # Premium features
├── components/            # Reusable UI components
├── createlisting/         # Create listing page
├── dashboard/             # User dashboard
├── listing/               # Listing detail page
├── login/                 # Login page
├── signup/                # Signup page
├── userlisting/           # User's own listings
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Homepage

models/
├── Listing.ts             # Listing schema
└── User.ts                # User schema

lib/
├── auth.ts                # Auth configuration
├── cloudinary.ts          # Image upload utilities
└── db.ts                  # Database connection
```

## Database Models

### User Model
```typescript
{
  name: string;
  email: string;
  phone: string;
  password: string;
  isPremium: boolean;
  premiumExpiry?: Date;
  showPhoneToNonPremium: boolean;
  profileImage?: string;
}
```

### Listing Model
```typescript
{
  title: string;
  description: string;
  price: number;
  category: 'car' | 'rental' | 'housing' | 'clothes';
  subcategory?: string;
  isElectric: boolean;
  location: {
    city: string;
    region: string;
    subcity?: string;
    woreda?: string;
    landmark?: string;
    country: string;
  };
  images: string[];
  owner: ObjectId;
  views: number;
  searchKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Search
- `GET /api/search?q=query&category=car&region=Addis+Ababa` - Search listings

### Premium
- `GET /api/premium/upgrade` - Get premium status
- `POST /api/premium/upgrade` - Upgrade to premium

## Ethiopian Market Features

### Supported Regions
- Addis Ababa
- Oromia
- Amhara
- Tigray
- Somali
- Afar
- Benishangul-Gumuz
- Gambela
- Harari
- Sidama
- Southern Nations, Nationalities, and Peoples (SNNP)

### Local Search Terms
The search engine supports Amharic search terms:
- መኪና (car)
- ቤት (housing)
- ሰፈር (rental)
- ልብስ (clothes)
- ኤሌክትሪክ (electric)
- ሃይብሪድ (hybrid)
- የጋብቻ (wedding)
- የግንባታ (construction)

## Monetization Strategy

### Premium Subscription (500 ETB/month)
- Unlimited phone number visibility
- Priority search placement
- Premium badge
- Analytics dashboard
- Featured listings

### Future Revenue Streams
- Featured listings (pay per listing)
- Business accounts
- Advertising space
- API access for businesses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@secondp.et or join our Telegram channel.

---

Built with ❤️ for Ethiopia