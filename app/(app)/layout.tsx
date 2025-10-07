"use client"

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
} from "lucide-react";

// Sidebar items configuration
const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
];

// Define the shape of the component's props
type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AppLayout({ children }: AppLayoutProps) {
  // State for controlling the sidebar drawer's open/close status
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Next.js routing hooks
  const pathname = usePathname();
  const router = useRouter();

  // Clerk authentication hooks
  const { signOut } = useClerk();
  const { user } = useUser(); // user is a Clerk UserResource or null

  // Function to handle clicking the logo to navigate to the home page
  const handleLogoClick = () => {
    router.push("/");
  };

  // Function to handle the sign-out action
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    // Main container for the layout, using DaisyUI's drawer classes
    <div className="drawer lg:drawer-open">
      {/* Hidden checkbox that controls the drawer state on small screens */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        // Controlled component: check status is linked to the sidebarOpen state
        checked={sidebarOpen}
        // Toggles the sidebarOpen state on change
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Content area that takes up the rest of the space */}
      <div className="drawer-content flex flex-col">
        {/* Navbar Header */}
        <header className="navbar w-full bg-base-200">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex-none lg:hidden">
              {/* Button/Label to open the sidebar on small screens */}
              <label
                htmlFor="sidebar-drawer"
                className="btn btn-square btn-ghost drawer-button"
              >
                <MenuIcon />
              </label>
            </div>

            {/* Logo/Title Link */}
            <div className="flex-1">
              <Link
                href="/"
                onClick={handleLogoClick}
                className="btn btn-ghost normal-case text-2xl font-bold tracking-tight cursor-pointer"
              >
                Cloudinary Showcase
              </Link>
            </div>

            {/* User Info and Sign Out (hidden on small screens) */}
            <div className="flex-none flex items-center space-x-4">
              {/* Conditional rendering for user-related elements */}
              {user && (
                <>
                  <div className="avatar">
                    {/* User Profile Image */}
                    <div className="w-8 h-8 rounded-full">
                      <img src={user.imageUrl} alt={user.username || user.emailAddresses[0].emailAddress} />
                    </div>
                  </div>
                  {/* User name or Email Address */}
                  <span className="text-sm truncate max-w-xs lg:max-w-md">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  {/* Sign Out Button (for the Navbar) */}
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-circle"
                  >
                    <LogOutIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow">
          {children}
        </main>
      </div>

      {/* Sidebar Drawer */}
      <div className="drawer-side">
        {/* Overlay/backdrop that closes the drawer when clicked */}
        <label htmlFor="sidebar-drawer" className="drawer-overlay" />

        <aside className="bg-base-200 w-64 h-full flex flex-col">
          {/* Sidebar Header/Logo Icon */}
          <div className="flex items-center justify-center py-4">
            <ImageIcon className="w-10 h-10 text-primary" />
          </div>

          {/* Sidebar Navigation Menu (flex-grow pushes content to top) */}
          <ul className="menu p-4 w-full text-base-content flex-grow">
            {sidebarItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  // Dynamic class based on active route
                  className={`
                    flex items-center space-x-4 py-2 rounded-lg 
                    ${pathname === item.href ? "bg-primary text-white" : "hover:bg-base-300"}
                  `}
                  // Close sidebar on click (for mobile/drawer view)
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Sign Out Button (at the bottom of the sidebar) */}
          {user && (
            <div className="p-4">
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-error w-full"
              >
                <LogOutIcon className="mr-2 h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}