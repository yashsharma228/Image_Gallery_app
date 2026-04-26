
# Image Gallery App

Full-stack image gallery platform with three apps in one repository:

- `admin-dashboard`: React admin panel for managing gallery content.
- `website`: Next.js user-facing gallery with Google sign-in, likes, and comments.
- `backend`: Express + MongoDB API for auth, images, likes, comments, and user data.

## Project Overview

This repository is split into separate frontend and backend applications that work together:

- Admins sign in with email/password or Firebase Google auth from the admin dashboard.
- Users sign in with Google on the public website.
- Images are uploaded to Cloudinary and metadata is stored in MongoDB.
- Users can browse, search, like, unlike, and comment on images.
- Admins can upload, edit, delete images, and inspect registered users.

## Repository Structure

```text
Image Gallery App/
├── admin-dashboard/   # React admin application
├── backend/           # Express API + MongoDB models/routes
├── website/           # Next.js public website
└── README.md
```

## Applications

### Admin Dashboard

Location: `admin-dashboard`

Tech:

- React 18
- React Router
- Tailwind CSS
- Axios
- Firebase client SDK

Implemented features:

- Admin registration and login
- Admin Google sign-in through Firebase
- JWT-based protected dashboard route
- Upload images to Cloudinary
- Edit and delete uploaded images
- View total images, likes, and registered users
- Admin profile modal
- Fetch admin session from backend

Main routes:

- `/login`
- `/register`
- `/dashboard`

Key files:

- `admin-dashboard/src/App.js`
- `admin-dashboard/src/pages/Login.js`
- `admin-dashboard/src/pages/Register.js`
- `admin-dashboard/src/pages/Dashboard.js`
- `admin-dashboard/src/components/ProtectedRoute.js`
- `admin-dashboard/src/api/index.js`

### Public Website

Location: `website`

Tech:

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Framer Motion
- Axios
- Firebase client SDK

Implemented features:

- Public home feed with image search and sorting
- Google authentication for users
- User dashboard feed
- Liked images page
- Like and unlike images
- Comment add, edit, delete, and list flow
- Animated UI with reusable image cards, modal, and header

Main routes:

- `/`
- `/login`
- `/dashboard`
- `/liked`

Key files:

- `website/src/app/page.js`
- `website/src/app/login/page.js`
- `website/src/app/dashboard/page.js`
- `website/src/app/liked/page.js`
- `website/src/hooks/useAuth.js`
- `website/src/lib/api.js`
- `website/src/lib/authService.js`

### Backend API

Location: `backend`

Tech:

- Node.js
- Express 4
- MongoDB + Mongoose
- JWT
- bcryptjs
- Cloudinary
- Firebase Admin SDK
- Helmet
- CORS
- cookie-parser

Implemented features:

- Admin auth with JWT and optional cookie session
- User auth via Firebase ID token verification
- Session check endpoint
- CRUD operations for images
- Like/unlike endpoints
- Fetch liked images with sorting
- Comment endpoints for users and admins
- User listing for admin dashboard
- Cloudinary upload optimization

Main route groups:

- `/api/auth`
- `/api/images`
- `/api/likes`
- `/api/comments`
- `/api/users`

Key files:

- `backend/server.js`
- `backend/routes/auth.js`
- `backend/routes/images.js`
- `backend/routes/likes.js`
- `backend/routes/comments.js`
- `backend/middleware/auth.js`
- `backend/models/Admin.js`
- `backend/models/User.js`
- `backend/models/Image.js`
- `backend/models/Like.js`
- `backend/models/Comment.js`

## Authentication Model

### Admin Auth

- Email/password login through `/api/auth/admin/login`
- Google/Firebase login through `/api/auth/admin/firebase-login`
- JWT stored in local storage on the admin frontend
- Protected admin routes validated by backend middleware

### User Auth

- Firebase Google sign-in on the public website
- Backend verifies Firebase ID token through `/api/auth/user/login`
- JWT added to authenticated requests for likes and comments

## Core Features

### Image Management

- Admin uploads images from the dashboard
- Files are streamed to Cloudinary using memory storage with `multer`
- Images are optimized with Cloudinary transformations
- Metadata is stored in MongoDB
- Admin can update title/description and delete images

### Feed and Discovery

- Public home page fetches all images
- Sorting supports `newest`, `oldest`, and `popular`
- Search filters by title, description, and uploader name on the frontend

### Likes

- Authenticated users can like and unlike images
- Like counts are maintained on image documents
- Liked images page returns the current user's saved collection

### Comments

- Users and admins can post comments on images
- Users can edit and delete their own comments
- Comment counts are tracked on image documents

## API Summary

Important backend endpoints currently used by the apps:

### Auth

- `POST /api/auth/admin/register`
- `POST /api/auth/admin/login`
- `POST /api/auth/admin/firebase-login`
- `POST /api/auth/user/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/auth/users`
- `POST /api/auth/logout`

### Images

- `POST /api/images/upload`
- `GET /api/images`
- `GET /api/images/:id`
- `PUT /api/images/:id`
- `DELETE /api/images/:id`

### Likes

- `POST /api/likes/:imageId`
- `DELETE /api/likes/:imageId`
- `GET /api/likes`

### Comments

- `POST /api/comments/:imageId`
- `PUT /api/comments/:commentId`
- `DELETE /api/comments/:commentId`
- `GET /api/comments/:imageId`

## Environment Variables

### Backend

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
PORT=5000
NODE_ENV=development
```

Notes:

- The backend uses Firebase Admin credentials for verifying Google sign-ins.
- A local `serviceAccountKey.json` file exists in the repo right now, but environment-based secrets are safer for deployment.

### Admin Dashboard

Create `admin-dashboard/.env.local`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### Website

Create `website/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Local Development

Install dependencies in each app:

```bash
cd backend && npm install
cd ../admin-dashboard && npm install
cd ../website && npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the admin dashboard:

```bash
cd admin-dashboard
npm start
```

Start the website on a different port than the admin app:

```bash
cd website
npm run dev -- -p 3001
```

Expected local URLs:

- Backend: `http://localhost:5000`
- Admin dashboard: `http://localhost:3000`
- Public website: `http://localhost:3001`

## Available Scripts

### Backend

- `npm start` - start Express server
- `npm run dev` - start Express server with nodemon

### Admin Dashboard

- `npm start` - run React development server
- `npm run build` - production build
- `npm test` - React test runner

### Website

- `npm run dev` - run Next.js development server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run Next.js linting

## Deployment Notes

### Backend

- Deploy the `backend` app to Render, Railway, or another Node host
- Set all environment variables in the deployment platform
- Ensure MongoDB and Cloudinary credentials are present
- Allow frontend origins and credentials in CORS

### Frontends

- Deploy `admin-dashboard` and `website` separately
- Point both to the deployed backend using their respective `*_API_BASE_URL` variables
- Configure Firebase authorized domains for deployed frontend URLs

## Current Data Model

Primary collections/models used by the project:

- `Admin`
- `User`
- `Image`
- `Like`
- `Comment`

## Recommended Verification Checklist

- Register or log in as admin
- Open the admin dashboard and verify session persistence
- Upload an image and confirm it appears in the public website feed
- Sign in as a user with Google
- Like and unlike an image
- Add, edit, and delete a comment
- Open the liked images page and verify saved items

## Known Operational Notes

- The admin and website apps both default to port 3000, so run one of them on a different port during local development.
- Admin auth currently uses JWTs in frontend storage and backend verification middleware.
- Deployed environments must allow auth headers and credentials for cross-origin requests.

## License

This project is currently documented as an educational portfolio or assignment project. Add a formal license if you plan to distribute it publicly.
