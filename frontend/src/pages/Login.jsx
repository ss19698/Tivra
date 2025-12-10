import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Form Submitted:", form);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-white-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-purple-500 text-center text-white">
          <h1 className="text-3xl font-bold">
            {isLoginPage ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-purple-100 mt-1">
            {isLoginPage
              ? "Login to continue your journey"
              : "Sign up to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {!isLoginPage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {isLoginPage && (
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <button type="button" className="text-purple-600 text-sm">
                Forgot password?
              </button>
            </div>
          )}

          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-700  text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
            {isLoginPage ? "Sign In" : "Create Account"}
            <ArrowRight className="w-5 h-5" />
          </button>

        </form>

        <div className="text-center pb-6">
          <p className="text-gray-600">
            {isLoginPage ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLoginPage(!isLoginPage)}
              className="text-purple-600 font-semibold ml-1"
            >
              {isLoginPage ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
