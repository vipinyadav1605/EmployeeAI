// # Complete Frontend Setup Guide

// ## 📁 Project Structure

// ```
// frontend/
// ├── public/
// │   ├── index.html
// │   └── favicon.ico
// ├── src/
// │   ├── pages/
// │   │   ├── Login.jsx                    # Enhanced login with Tailwind
// │   │   ├── Register.jsx                 # Enhanced register with Tailwind
// │   │   ├── Dashboard.jsx                # Main dashboard
// │   │   ├── AdminDashboard.jsx           # Admin panel
// │   │   ├── EmployeeManagement.jsx       # Employee CRUD
// │   │   ├── LeaveManagement.jsx          # Leave requests & approval
// │   │   ├── AttendanceManagement.jsx     # Attendance tracking
// │   │   ├── BonusManagement.jsx          # Bonus management
// │   │   ├── PerformanceReviews.jsx       # Performance reviews
// │   │   ├── ProjectManagement.jsx        # Project & task management
// │   │   ├── ChatPage.jsx                 # Real-time chat
// │   │   ├── NotificationsPage.jsx        # Notifications
// │   │   └── ProfilePage.jsx              # User profile
// │   ├── components/
// │   │   ├── Sidebar.jsx                  # Navigation sidebar
// │   │   ├── Header.jsx                   # Page header with stats
// │   │   └── Common.jsx                   # Reusable UI components
// │   ├── services/
// │   │   └── api.js                       # API service layer
// │   ├── App.jsx                          # Main app with routing & auth
// │   ├── App.css                          # Global styles
// │   ├── index.css                        # Tailwind directives
// │   ├── main.jsx                         # Entry point
// │   └── index.html
// ├── tailwind.config.js                   # Tailwind configuration
// ├── postcss.config.js                    # PostCSS configuration
// ├── vite.config.js                       # Vite configuration
// ├── package.json
// └── .env                                 # Environment variables
// ```

// ## 🚀 Installation Steps

// ### 1. Create React App with Vite

// ```bash
// npm create vite@latest frontend -- --template react
// cd frontend
// npm install
// ```

// ### 2. Install Dependencies

// ```bash
// npm install axios react-router-dom
// npm install -D tailwindcss postcss autoprefixer
// npx tailwindcss init -p
// ```

// ### 3. Configure Tailwind CSS

// **tailwind.config.js:**
// ```javascript
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'blue': {
//           '50': '#eff6ff',
//           '100': '#dbeafe',
//           '200': '#bfdbfe',
//           '300': '#93c5fd',
//           '400': '#60a5fa',
//           '500': '#3b82f6',
//           '600': '#2563eb',
//           '700': '#1d4ed8',
//           '800': '#1e40af',
//           '900': '#1e3a8a',
//         },
//       },
//     },
//   },
//   plugins: [],
// }
// ```

// **postcss.config.js:**
// ```javascript
// export default {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// }
// ```

// ### 4. Update src/index.css

// ```css
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

// * {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
// }

// body {
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
//     'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
//     sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
// }
// ```

// ### 5. Create .env File

// ```env
// VITE_API_URL=http://localhost:8000/api
// VITE_APP_NAME=EmployHub
// ```

// ### 6. Update src/main.jsx

// ```javascript
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
// ```

// ## 📋 File Creation Checklist

// ### Pages to Create
// - [ ] `pages/Login.jsx` - Enhanced login with Tailwind
// - [ ] `pages/Register.jsx` - Enhanced register with Tailwind
// - [ ] `pages/Dashboard.jsx` - Main dashboard
// - [ ] `pages/AdminDashboard.jsx` - Admin panel with employee management
// - [ ] `pages/EmployeeManagement.jsx` - Employee CRUD operations
// - [ ] `pages/LeaveManagement.jsx` - Leave request & approval system
// - [ ] `pages/AttendanceManagement.jsx` - Attendance tracking
// - [ ] `pages/BonusManagement.jsx` - Bonus allocation & approval
// - [ ] `pages/PerformanceReviews.jsx` - Performance review management
// - [ ] `pages/ProjectManagement.jsx` - Projects & tasks
// - [ ] `pages/ChatPage.jsx` - Real-time messaging
// - [ ] `pages/NotificationsPage.jsx` - Notification center
// - [ ] `pages/ProfilePage.jsx` - User profile & settings

// ### Components to Create
// - [ ] `components/Sidebar.jsx` - Navigation sidebar
// - [ ] `components/Header.jsx` - Page header with statistics
// - [ ] `components/Common.jsx` - Reusable components (Modal, Card, Table, etc.)

// ### Services
// - [ ] `services/api.js` - Axios instance with API endpoints

// ## 🔑 Key Features Implemented

// ### Authentication
// - ✅ JWT-based login/register
// - ✅ Token refresh mechanism
// - ✅ Protected routes with role-based access
// - ✅ Auth context for state management

// ### Employee Management
// - ✅ CRUD operations
// - ✅ Search & filter
// - ✅ Pagination
// - ✅ Sorting

// ### Leave Management
// - ✅ Request leaves
// - ✅ Manager approval workflow
// - ✅ Leave balance tracking
// - ✅ Leave history

// ### Attendance
// - ✅ Check-in/check-out
// - ✅ Attendance summary
// - ✅ Monthly reports

// ### Bonuses & Salary
// - ✅ Bonus allocation
// - ✅ Approval workflow
// - ✅ Salary history

// ### Performance Management
// - ✅ Performance reviews
// - ✅ Multi-criteria ratings
// - ✅ Review tracking

// ### Projects & Tasks
// - ✅ Project creation
// - ✅ Task assignment
// - ✅ Status tracking

// ### Communication
// - ✅ Real-time chat
// - ✅ Notifications
// - ✅ Message read status

// ### Admin Features
// - ✅ Employee management
// - ✅ Role assignment
// - ✅ System administration

// ## 🎨 Tailwind CSS Classes Used

// ### Layout
// - `flex`, `grid`, `gap`, `p-`, `m-`
// - `min-h-screen`, `h-screen`, `w-full`
// - `fixed`, `sticky`, `absolute`, `relative`

// ### Colors
// - `bg-white`, `bg-slate-*`, `bg-blue-*`
// - `text-slate-*`, `text-blue-*`
// - `border-slate-*`, `border-blue-*`

// ### Effects
// - `shadow-lg`, `shadow-md`, `shadow-sm`
// - `rounded-lg`, `rounded-xl`, `rounded-full`
// - `opacity-*`, `hover:`, `focus:`, `disabled:`

// ### Responsive
// - `md:`, `lg:`, `xl:` breakpoints
// - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

// ## 🔄 API Integration Flow

// 1. User logs in → JWT tokens stored in localStorage
// 2. API service adds token to all requests
// 3. Token refresh on 401 response
// 4. Automatic logout on token expiration
// 5. Protected routes redirect to login

// ## 🧪 Testing the Frontend

// ### Start Development Server
// ```bash
// npm run dev
// ```

// ### Demo Credentials
// ```
// Admin:    admin@company.com / password123
// HR:       hr@company.com / password123
// Manager:  manager@company.com / password123
// Employee: employee@company.com / password123
// ```

// ### Test Workflow
// 1. Login with demo credentials
// 2. Navigate to different pages
// 3. Test CRUD operations
// 4. Verify role-based access
// 5. Test notifications & chat

// ## 📱 Responsive Design

// All pages are fully responsive:
// - Mobile: Single column layout, hamburger menu (optional)
// - Tablet: Two-column grid
// - Desktop: Full multi-column layout with sidebar

// ## 🚀 Production Build

// ```bash
// # Build for production
// npm run build

// # Preview production build
// npm run preview

// # Deploy to Vercel/Netlify
// # Just push to git, automatic deployment
// ```

// ## 🔗 Environment Variables

// ```env
// # .env
// VITE_API_URL=http://localhost:8000/api
// VITE_APP_NAME=EmployHub

// # .env.production
// VITE_API_URL=https://api.yourdomain.com/api
// VITE_APP_NAME=EmployHub
// ```

// ## 📚 Additional Pages Template

// For creating additional pages like `EmployeeManagement.jsx`:

// ```javascript
// import React, { useState, useEffect } from "react";
// import Sidebar from "../components/Sidebar";
// import Header from "../components/Header";
// import { Card, Button, Table } from "../components/Common";
// import { employeeAPI } from "../services/api";

// export default function EmployeeManagement() {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await employeeAPI.list({ page: 1, limit: 10 });
//       setEmployees(res.data.results);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <Sidebar />
//       <main className="flex-1 ml-64">
//         <Header title="Employee Management" />
//         <div className="p-8">
//           <Card>
//             <Table
//               columns={[
//                 { key: "name", label: "Name" },
//                 { key: "email", label: "Email" },
//                 { key: "department", label: "Department" },
//               ]}
//               data={employees}
//               loading={loading}
//             />
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }
// ```

// ## 🎯 Next Steps

// 1. Copy all provided files to your project
// 2. Install dependencies
// 3. Update API URLs in `.env`
// 4. Run `npm run dev`
// 5. Login with demo credentials
// 6. Test all features
// 7. Deploy to production

// ## 📞 Support

// For issues or questions:
// 1. Check console for error messages
// 2. Verify backend is running on port 8000
// 3. Check network tab in browser DevTools
// 4. Verify API responses match expected format

// ---

// **Happy coding! 🚀**
