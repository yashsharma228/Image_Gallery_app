
# Image Gallery App

A full-stack image gallery platform with:
- **Admin Dashboard** (React.js)
- **Public Website** (Next.js)
- **Backend API** (Express.js)

## 🚀 Features

### Admin Dashboard (React.js)
- Email & Password login with JWT
- Password hashing using bcrypt
- Protected routes
- Image upload to Cloudinary with compression
- View, edit, and delete images
- Image management interface

### Public Website (Next.js)
- Google Login using Firebase Authentication
- Image feed with sorting (Newest, Oldest, Most Popular)
- Like/Unlike images (authenticated users only)
- Liked images page
- Responsive design with Tailwind CSS

### Backend API (Express.js)
- Admin login API (email/password with JWT)
- User login API (Google Firebase token verification)
- JWT middleware for protected routes
- Image upload/edit/delete APIs (Admin only)
- Get images API with sorting
- Like/Unlike image APIs
- MongoDB database integration
- CORS configuration

### Cloudinary Integration
- Image upload with automatic compression
- Quality & format optimization
- Dimension limiting (max 1920x1080)
- Image deletion from Cloudinary

### Database Schema
- Admin, User, Image, Like models

## 🛠️ Configuration

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
PORT=5000
NODE_ENV=production
```

### Admin Dashboard (.env.local)
```
REACT_APP_API_BASE_URL=https://image-gallery-app-x1jt.onrender.com/api
```

### Website (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=https://image-gallery-app-x1jt.onrender.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## ⚡ Getting Started

### 1. Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on: http://localhost:5000

### 2. Start Admin Dashboard
```bash
cd admin-dashboard
npm install
npm start
```
Admin Dashboard runs on: http://localhost:3000

### 3. Start Website
```bash
cd website
npm install
npm run dev
```
Website runs on: http://localhost:3001

## 📦 Deployment

### Backend (Render/AWS/DigitalOcean)
- Set environment variables
- Deploy Express.js server
- Configure CORS for frontend domains

### Admin Dashboard (Vercel/Netlify)
- Set `REACT_APP_API_BASE_URL` to deployed backend URL
- Build and deploy

### Website (Vercel)
- Set `NEXT_PUBLIC_API_BASE_URL` to deployed backend URL
- Configure Firebase for production domain
- Deploy

## 🔄 Complete Flow

1. **Admin Uploads Image**
  - Admin logs in at `/admin`
  - Uploads image (Cloudinary)
  - Image metadata saved to MongoDB
  - Image appears in admin dashboard

2. **Image Appears in User Website**
  - User visits `/`
  - Image appears in feed
  - User can view, sort, and like images

3. **User Likes Image**
  - User logs in with Google
  - Likes image
  - Like count updates
  - Image appears in "My Likes" page

4. **User Views Liked Images**
  - User clicks "❤️ My Likes"
  - Sees all liked images

## 🎯 Tech Stack

- React.js, Next.js, Express.js, MongoDB, Cloudinary, Firebase

## 🛡️ Security

- Passwords hashed with bcrypt
- JWT authentication
- Firebase token validation
- CORS for allowed domains
- Environment variables for secrets
- Protected routes
- Input validation

## 🧪 Testing

- Register/login as admin
- Upload/edit/delete images
- Google login as user
- Like/unlike images
- View liked images
- Test all API endpoints

## 📝 Assignment Requirements Met

✅ Tech Stack: React.js, Next.js, Express.js, MongoDB, Cloudinary, Firebase
✅ Authentication: Admin (Email/Password + JWT), Users (Google + Firebase)
✅ Image Storage: Cloudinary with compression
✅ Database: MongoDB with proper schemas
✅ Security: JWT, bcrypt, Firebase token validation
✅ Features: Upload, Edit, Delete, Like, Sort
✅ Deployment Ready: Environment variables configured

## 🧩 Future Enhancements

- [ ] Pagination for image feed
- [ ] Image search
- [ ] User comments
- [ ] Image categories/tags
- [ ] User follow system
- [ ] Admin analytics dashboard
- [ ] Image ratings/reviews
- [ ] Bulk upload
- [ ] Sharing features
- [ ] Notifications system

## 📋 License

Open source for educational purposes.

## 🙋‍♂️ Support

For issues and questions, please refer to the documentation or create an issue in the repository.
