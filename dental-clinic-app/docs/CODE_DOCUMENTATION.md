# Dental Clinic Management System - Code Documentation

This document provides a detailed, line-by-line explanation of the key components in the Dental Clinic Management System. It is designed for developers who want to understand exactly how the application works, how data flows, and how to modify it.

---

## 1. Project Structure

```
frontend/src/
├── components/         # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── patients/       # Patient-specific components (Forms)
│   ├── ui/             # Generic UI elements (Buttons, Inputs, Modals)
│   └── Login.tsx       # Login page component
├── pages/              # Main page views
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   └── ...
├── services/           # API communication layer
│   ├── auth.service.ts
│   ├── patient.service.ts
│   └── ...
├── types/              # TypeScript interfaces
│   ├── auth.ts
│   └── patient.ts
└── App.tsx             # Main application entry point
```

---

## 2. Authentication Flow

### `src/components/Login.tsx`
This component handles user authentication.

**Imports:**
```typescript
import React, { useState } from 'react';
import { login } from '../services/auth.service'; // Import the login function from our service
import { Button } from './ui/Button'; // Reusable Button component
import { Input } from './ui/Input';   // Reusable Input component
import { User, Lock, LogIn } from 'lucide-react'; // Icons
```

**Component Definition:**
```typescript
export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // State hooks to manage form data and UI state
  const [username, setUsername] = useState(''); // Stores the username input
  const [password, setPassword] = useState(''); // Stores the password input
  const [error, setError] = useState('');       // Stores any error messages
  const [loading, setLoading] = useState(false);// Tracks if a request is in progress
```

**Form Submission Handler:**
```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission (page reload)
    setError('');       // Clear any previous errors
    setLoading(true);   // Show loading spinner

    try {
      // Call the login API service
      const response = await login(username, password);
      
      // Check if login was successful and we got an access token
      if (response.success && response.data.accessToken) {
        // Call the parent component's callback with the new token
        onLoginSuccess(response.data.accessToken);
      } else {
        // If success is false, show the error message from backend
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      // Catch network errors or unexpected exceptions
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false); // Hide loading spinner regardless of outcome
    }
  };
```

### `src/services/auth.service.ts`
This file handles the actual HTTP request to the backend.

```typescript
const API_URL = 'http://localhost:4000/api/auth'; // Backend API endpoint

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    // Make a POST request to the login endpoint
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Tell server we are sending JSON
        },
        // Convert our data object to a JSON string
        body: JSON.stringify({ username, password }),
    });

    // Check if the server returned a success status code (200-299)
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    // Parse and return the JSON response
    return response.json();
};
```

---

## 3. API Communication Deep Dive

Fetching data from an API is a core part of this application. We use the native `fetch` API wrapped in `async/await` functions.

### How it works (Step-by-Step)

1.  **The Service Function**: We create a dedicated function (e.g., `getPatients`) in a service file (e.g., `patient.service.ts`). This keeps our API logic separate from our UI logic.

```typescript
// src/services/patient.service.ts

// 1. Define the function as 'async' because network requests take time
export const getPatients = async (token: string) => {
    
    // 2. Use 'await fetch(...)' to send the request
    const response = await fetch('http://localhost:4000/api/patients', {
        method: 'GET', // HTTP Method: GET, POST, PUT, DELETE
        headers: {
            // 3. Authorization Header: Send the JWT token to prove who we are
            'Authorization': `Bearer ${token}`,
            // Content-Type: Tell server we want/send JSON
            'Content-Type': 'application/json',
        }
    });

    // 4. Check for HTTP errors (like 401 Unauthorized or 500 Server Error)
    if (!response.ok) {
        throw new Error('Failed to fetch patients');
    }

    // 5. Parse the JSON body of the response
    return response.json();
};
```

2.  **Using it in a Component**: Inside a React component (like `PatientsPage.tsx`), we call this function.

```typescript
// src/pages/PatientsPage.tsx

useEffect(() => {
    // We need a separate async function inside useEffect
    const loadData = async () => {
        try {
            setLoading(true); // Start loading state
            const data = await getPatients(token); // Call our service
            setPatients(data); // Save data to state
        } catch (error) {
            setError(error.message); // Handle errors
        } finally {
            setLoading(false); // Stop loading state
        }
    };

    loadData(); // Execute the function
}, [token]); // Re-run if token changes
```

---

## 4. Framework Syntax Guide

We use a modern tech stack. Here is a quick guide to the syntax we use.

### React (The UI Library)
*   **Components**: Functions that return HTML (JSX).
    ```tsx
    function Welcome() {
        return <h1>Hello, World!</h1>;
    }
    ```
*   **Props**: Arguments passed to components (like HTML attributes).
    ```tsx
    function Welcome({ name }: { name: string }) {
        return <h1>Hello, {name}</h1>;
    }
    // Usage: <Welcome name="Alice" />
    ```
*   **State (`useState`)**: Variables that change over time and trigger re-renders.
    ```tsx
    const [count, setCount] = useState(0);
    // setCount(count + 1) updates the value and refreshes the UI
    ```
*   **Effects (`useEffect`)**: Code that runs when the component loads or updates (fetching data, subscriptions).

### TypeScript (The Language)
Adds types to JavaScript to prevent bugs.
*   **Interfaces**: Define the shape of an object.
    ```ts
    interface Patient {
        id: string;
        name: string;
        age: number;
    }
    ```
*   **Type Annotations**: Telling TS what type a variable is.
    ```ts
    const add = (a: number, b: number): number => {
        return a + b;
    };
    ```

### Tailwind CSS (The Styling)
Instead of writing CSS files, we use utility classes directly in HTML.
*   `flex`: `display: flex`
*   `p-4`: `padding: 1rem` (16px)
*   `bg-blue-500`: `background-color: #3b82f6`
*   `text-white`: `color: white`
*   `rounded-lg`: `border-radius: 0.5rem`

**Example:**
```tsx
<button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
    Click Me
</button>
```

---

## 5. How to Add a New Component

Let's say you want to add a simple "Patient Card" component to display patient info nicely.

### Step 1: Create the Component File
Create `src/components/patients/PatientCard.tsx`.

```tsx
import React from 'react';
import { Patient } from '../../types/patient'; // Import the type

// Define what data this component needs (Props)
interface PatientCardProps {
    patient: Patient;
    onEdit: (patient: Patient) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit }) => {
    return (
        <div className="border p-4 rounded-lg shadow-sm bg-white">
            <h3 className="font-bold text-lg">{patient.firstName} {patient.lastName}</h3>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-gray-600">{patient.phone}</p>
            
            <button 
                onClick={() => onEdit(patient)}
                className="mt-2 text-blue-500 hover:text-blue-700"
            >
                Edit Patient
            </button>
        </div>
    );
};
```

### Step 2: Use it in a Page
Open `src/pages/PatientsPage.tsx` and import your new component.

```tsx
import { PatientCard } from '../components/patients/PatientCard';

// ... inside the component ...

return (
    <div className="grid grid-cols-3 gap-4">
        {patients.map(patient => (
            <PatientCard 
                key={patient.id} 
                patient={patient} 
                onEdit={handleEditPatient} 
            />
        ))}
    </div>
);
```

---

## 6. Layout System

### `src/components/layout/MainLayout.tsx`
This component wraps all authenticated pages, providing the Sidebar and Header.

**State Management:**
```typescript
export function MainLayout({ token, onLogout }: MainLayoutProps) {
  // Track which page is currently active
  const [activePage, setActivePage] = useState('dashboard');

  // Helper function to decode the JWT token and get the username
  const getUserName = () => {
    try {
      // Split token into parts (Header.Payload.Signature)
      // Decode the Payload (2nd part) from Base64
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };
```

**Page Rendering Logic:**
```typescript
  // Switch statement to decide which component to render based on activePage state
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'patients':
        return <PatientsPage token={token} />; // Pass token to pages that need API access
      // ... other cases
      default:
        return <DashboardPage />;
    }
  };
```

**JSX Structure:**
```typescript
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage} // Pass function to change active page
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header title={getPageTitle()} userName={getUserName()} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {renderPage()} {/* Render the active page component here */}
        </main>
      </div>
    </div>
  );
```

---

## 7. Modification Guide

### How to Add a New Page
1.  **Create the Page Component**: Create `src/pages/NewPage.tsx`.
2.  **Update Layout**:
    *   Open `src/components/layout/MainLayout.tsx`.
    *   Add the new case to `renderPage()` switch statement.
    *   Add the title to `getPageTitle()`.
3.  **Update Sidebar**:
    *   Open `src/components/layout/Sidebar.tsx`.
    *   Add a new button to the menu list calling `onPageChange('newpage')`.

### How to Add a New Field to Patient
1.  **Update Backend**:
    *   Modify `prisma/schema.prisma` to add the field.
    *   Run `npx prisma migrate dev`.
    *   Update `PatientService` in backend to handle the new field.
2.  **Update Frontend Types**:
    *   Open `src/types/patient.ts`.
    *   Add the field to `Patient`, `CreatePatientDTO`, and `UpdatePatientDTO` interfaces.
3.  **Update Form**:
    *   Open `src/components/patients/PatientForm.tsx`.
    *   Add the field to `initialState`.
    *   Add an `<Input />` component for the new field.
4.  **Update Table**:
    *   Open `src/pages/PatientsPage.tsx`.
    *   Add a `<TableHeadCell>` for the column header.
    *   Add a `<TableCell>` to display the data.

### How to Change API Endpoint
1.  Open the relevant service file (e.g., `src/services/patient.service.ts`).
2.  Modify the `API_URL` constant at the top of the file.
3.  Ensure `vite.config.ts` proxy settings match if using a proxy.

---

## 8. Troubleshooting Common Issues

*   **403 Forbidden**: You are trying to perform an action (like delete) that your user role doesn't have permission for. Check `backend/src/routes/*.routes.ts` to see `authorize(...)` rules.
*   **400 Bad Request**: You are sending data in the wrong format. Check the Network tab in browser dev tools to see the request payload and compare it with what the backend expects.
*   **CORS Error**: The frontend and backend are on different ports and CORS is not configured, or the proxy in `vite.config.ts` is not working. Ensure backend allows the frontend origin.
