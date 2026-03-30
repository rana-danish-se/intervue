"use client";

export default function GoogleButton() {
  const handleGoogleLogin = () => {
    // Redirect the browser window straight to your Express backend Google Auth route.
    // The backend will handle the redirect to Google's consent screen.
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <button 
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all mb-6 group"
    >
      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.74 22.37 10.04H12V14.22H17.93C17.67 15.56 16.91 16.7 15.76 17.47V20.24H19.33C21.41 18.32 22.56 15.53 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C14.97 23 17.46 22.02 19.33 20.24L15.76 17.47C14.75 18.15 13.48 18.56 12 18.56C9.13 18.56 6.7 16.63 5.82 14.04H2.15V16.89C3.96 20.49 7.68 23 12 23Z" fill="#34A853"/>
        <path d="M5.82 14.04C5.59 13.37 5.46 12.65 5.46 11.91C5.46 11.17 5.59 10.45 5.82 9.78V6.93H2.15C1.41 8.41 1 10.1 1 11.91C1 13.72 1.41 15.41 2.15 16.89L5.82 14.04Z" fill="#FBBC05"/>
        <path d="M12 5.26C13.62 5.26 15.06 5.82 16.2 6.9L19.41 3.69C17.45 1.87 14.97 0.81 12 0.81C7.68 0.81 3.96 3.32 2.15 6.93L5.82 9.78C6.7 7.19 9.13 5.26 12 5.26Z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}
