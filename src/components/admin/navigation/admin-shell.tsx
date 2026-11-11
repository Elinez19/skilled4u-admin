"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminNav } from "@/hooks/admin/use-admin-nav";
import { useAdminSession } from "@/hooks/admin/use-admin-session";
import { motionTokens } from "@/lib/motion";
import { AdminDashboardNavbar } from "./admin-dashboard-navbar";
import { AdminIdleWarningBanner } from "./admin-idle-warning-banner";
import { AdminSidebar } from "./admin-sidebar";

/**
 * Dedicated Admin Sidebar Shell with Custom Glossy White Sidebar & Custom Dashboard Navbar
 * Provides a sticky full-height sidebar on desktop (`lg:w-64`) and a slide-over
 * sidebar drawer on mobile devices, paired with the custom dashboard navbar & workspace.
 * Enforces session verification against /api/v1/auth/me and a 30-minute idle inactivity timeout.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const {
    pathname,
    mobileOpen,
    closeMobileSidebar,
    toggleMobileSidebar,
  } = useAdminNav();

  const {
    adminUser,
    adminName,
    adminRoleTitle,
    idleSecondsRemaining,
    isSigningOut,
    handleSignOut,
    verifyAdminSession,
  } = useAdminSession();

  return (
    <div className="no-scrollbar min-h-screen flex bg-surface-pearl text-ink-primary">
      {/* Non-blocking sign-out progress bar (the clicked button also shows an inline spinner) */}
      <AnimatePresence>
        {isSigningOut && (
          <motion.div
            role="progressbar"
            aria-label="Signing out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px] overflow-hidden bg-brand-100/70"
          >
            <motion.div
              className="h-full w-2/5 rounded-pill bg-gradient-to-r from-accent-sky via-brand-600 to-accent-gold"
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar (Premium Glossy White, No Scrollbars) */}
      <aside className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          <AdminSidebar
            pathname={pathname}
            onSignOut={() => handleSignOut()}
            isSigningOut={isSigningOut}
            adminName={adminName}
            adminRoleTitle={adminRoleTitle}
          />
        </div>
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionTokens.duration.fast }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-surface-glass-dark backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={motionTokens.spring.snappy}
              className="relative z-10 h-full w-72 max-w-[85vw] overflow-hidden"
            >
              <AdminSidebar
                pathname={pathname}
                onNavigate={closeMobileSidebar}
                onSignOut={() => handleSignOut()}
                isSigningOut={isSigningOut}
                adminName={adminName}
                adminRoleTitle={adminRoleTitle}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Right Main Column with Custom Dashboard Navbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminDashboardNavbar
          pathname={pathname}
          mobileOpen={mobileOpen}
          onToggleMobile={toggleMobileSidebar}
          onSignOut={() => handleSignOut()}
          isSigningOut={isSigningOut}
          adminUser={adminUser}
        />

        {/* Idle Timeout Countdown Warning Banner */}
        <AdminIdleWarningBanner
          idleSecondsRemaining={idleSecondsRemaining}
          onStaySignedIn={() => verifyAdminSession()}
          onSignOut={() => handleSignOut()}
          isSigningOut={isSigningOut}
        />

        {/* Main Admin Content Area */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-2.5 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

