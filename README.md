# Image Gallery Web Application

A full-stack image gallery platform with admin dashboard and public website built with React, Next.js, Express.js, MongoDB, and Cloudinary.

## Project Structure

```
Image Gallery App/
├── backend/                 # Express.js API
├── admin-dashboard/         # React.js Admin Portal
└── website/                 # Next.js Public Website
```

## Features

### Admin Dashboard (React.js)
- **Authentication**: Email & password login with JWT tokens
- **Image Management**: Upload, edit, and delete images
- **Image Metadata**: Manage titles and descriptions
- **Dashboard**: View all uploaded images with management tools

### Public Website (Next.js)
- **Image Feed**: Browse all images with sorting options
- **Google Authentication**: Firebase-based Google login
- **Like/Unlike**: Interact with images (authenticated users only)
- **Personal Collection**: View only liked images
- **Sorting**: Newest first, oldest first, or most popular

### Backend (Express.js)
- **REST APIs**: Fully functional REST endpoints
- **Image Storage**: Cloudinary integration for image hosting
- **Database**: MongoDB for data persistence
- **Security**: JWT authentication, bcrypt password hashing
- **Validation**: Input validation with express-validator
- **CORS**: Configured for frontend applications

## Tech Stack

### Frontend
- **Admin Dashboard**: React.js 18, Tailwind CSS, Axios
- **Public Website**: Next.js 14 (App Router), Tailwind CSS, Firebase Auth

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- Cloudinary account
- Firebase project
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and configure:
```bash
MONGODB_URI=mongodb://localhost:27017/image-gallery
JWT_SECRET=your_secure_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
ADMIN_DASHBOARD_URL=http://localhost:3000
WEBSITE_URL=http://localhost:3001
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### Admin Dashboard Setup

1. Navigate to the admin-dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

### Public Website Setup

1. Navigate to the website directory:
```bash
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:
```bash
npm run dev
```

The website will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/admin/register` - Register admin account
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - User login with Firebase token

### Images
- `GET /api/images` - Get all images (supports sorting)
  - Query params: `sort` (newest, oldest, popular), `userId` (for like status)
- `GET /api/images/:id` - Get single image
- `POST /api/images/upload` - Upload image (admin only)
- `PUT /api/images/:id` - Edit image metadata (admin only)
- `DELETE /api/images/:id` - Delete image (admin only)

### Likes
- `POST /api/likes/:imageId/like` - Like an image (authenticated users)
- `DELETE /api/likes/:imageId/like` - Unlike an image (authenticated users)
- `GET /api/likes` - Get user's liked images (authenticated users)

## Database Schema

### Admin
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  createdAt: Date
}
```

### User
```javascript
{
  firebaseUid: String (unique, required),
  email: String (unique, required),
  name: String,
  profilePicture: String,
  createdAt: Date
}
```

### Image
```javascript
{
  url: String (required),
  publicId: String (Cloudinary ID, required),
  title: String (required),
  description: String,
  uploadedBy: ObjectId (ref: Admin, required),
  uploadedDate: Date,
  likeCount: Number
}
```

### Like
```javascript
{
  user: ObjectId (ref: User, required),
  image: ObjectId (ref: Image, required),
  createdAt: Date
}
```

## Deployment

### Backend Deployment

#### Option 1: Render
1. Push code to GitHub
2. Connect to Render
3. Set environment variables in Render dashboard
4. Deploy

#### Option 2: AWS EC2 / DigitalOcean
1. Set up server instance
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### Admin Dashboard Deployment

#### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variables

#### Vercel
1. Import project to Vercel
2. Set environment variables
3. Deploy

### Public Website Deployment

#### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy automatically on push

## Security Considerations

1. **Password Hashing**: All admin passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Firebase Verification**: Backend validates Firebase ID tokens
4. **CORS**: Only allowed domains can access the API
5. **Environment Variables**: Sensitive data stored in environment variables
6. **Protected Routes**: Admin routes require authentication
7. **Input Validation**: All inputs validated using express-validator

## Testing

### Manual Testing Checklist

1. **Admin Dashboard**
   - [ ] Register new admin account
   - [ ] Login with credentials
   - [ ] Upload image with metadata
   - [ ] Edit image details
   - [ ] Delete image
   - [ ] Verify images appear in feed

2. **Public Website**
   - [ ] View image feed
   - [ ] Sort images (newest, oldest, popular)
   - [ ] Login with Google
   - [ ] Like/unlike images
   - [ ] View liked images page
   - [ ] Verify like count updates

3. **Backend API**
   - [ ] Test all endpoints with Postman/Thunder Client
   - [ ] Verify JWT token generation
   - [ ] Test image upload to Cloudinary
   - [ ] Verify database operations
   - [ ] Test error handling

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access is allowed (if using MongoDB Atlas)

### Cloudinary Upload Fails
- Verify API credentials
- Check folder name configuration
- Ensure sufficient API quota

### Firebase Authentication Issues
- Verify Firebase credentials
- Check Firebase console configuration
- Ensure allowed domains are configured

### CORS Errors
- Verify frontend URLs in backend `.env`
- Check browser console for exact error
- Ensure credentials: true is set if using cookies

## Performance Optimization

1. **Image Optimization**: Cloudinary provides automatic image optimization
2. **Database Indexes**: Indexes on `uploadedDate` and `likeCount` for fast sorting
3. **Lazy Loading**: Next.js image optimization
4. **Pagination**: Can be added for large image collections

## Future Enhancements

- [ ] Implement pagination for image feed
- [ ] Add image search functionality
- [ ] Implement user comments on images
- [ ] Add image categories/tags
- [ ] Create user follow system
- [ ] Add admin analytics dashboard
- [ ] Implement image ratings/reviews
- [ ] Add bulk upload functionality
- [ ] Create sharing features
- [ ] Add notifications system

## License

This project is open source and available for educational purposes.

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.
