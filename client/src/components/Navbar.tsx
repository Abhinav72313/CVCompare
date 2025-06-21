"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { FileText, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className=" mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}                    <Link href="/" className="flex items-center space-x-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <span className="font-bold text-xl text-gray-900">CVCompare</span>
                    </Link>{/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <SignedIn>
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/upload"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Upload Resume
                            </Link>
                            <Link
                                href="/history"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                History
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Authentication Section */}
                    <div className="flex items-center space-x-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex items-center space-x-2"
                                >
                                    <span>Sign In</span>
                                </Button>
                            </SignInButton>

                            {/* Mobile Sign In */}
                            <SignInButton mode="modal">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="sm:hidden"
                                >
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8"
                                    }
                                }}
                                afterSignOutUrl="/"
                            />
                        </SignedIn>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
                        <div className="flex flex-col space-y-2">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>                            <SignedIn>
                                <Link
                                    href="/upload"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Upload Resume
                                </Link>
                                <Link
                                    href="/history"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    History
                                </Link>
                                <Link
                                    href="/analysis"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Analysis
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
