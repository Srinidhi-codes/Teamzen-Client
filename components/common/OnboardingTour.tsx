"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";

export function useOnboardingTour(isBlocked = false) {
    const { user, setSidebarCollapsed, setSidebarMobileOpen } = useStore();
    const { updateUserAsync } = useGraphQLUpdateUser();

    const startTour = useCallback(() => {
        // Ensure sidebar is visible for the tour
        setSidebarCollapsed(false);
        setSidebarMobileOpen(true);

        const driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: 'driverjs-theme',
            steps: [
                {
                    element: '#navbar-nav-dashboard',
                    popover: {
                        title: 'Welcome to Teamzen!',
                        description: 'This is your central command center where you can view your attendance stats and upcoming events.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#ai-assistant-trigger',
                    popover: {
                        title: 'Smart AI Assistant',
                        description: 'Have questions? Our AI is here to help you with leaves, policies, and company info 24/7.',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-leaves',
                    popover: {
                        title: 'Manage your Leaves',
                        description: 'Plan your vacations, check your balances, and track leave requests with ease.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-attendance',
                    popover: {
                        title: 'Time & Attendance',
                        description: 'Punch in/out, view your work history, and manage attendance corrections.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#user-menu-trigger',
                    popover: {
                        title: 'Your Account',
                        description: 'Access your profile, settings, and more from here. You can also re-run this tour anytime!',
                        side: "bottom",
                        align: 'end'
                    }
                },
            ]
        });

        driverObj.drive();
    }, [setSidebarCollapsed, setSidebarMobileOpen]);

    useEffect(() => {
        if (isBlocked) return;
        if (user && user.hasSeenOnboarding === false) {
            // Give time after blocking elements (like FirstDayWizard) are cleared
            const timer = setTimeout(() => {
                startTour();
                // Persist to DB immediately
                updateUserAsync({ has_seen_onboarding: true }).catch(console.error);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [user, startTour, updateUserAsync, isBlocked]);

    return { startTour };
}

export function OnboardingTour({ isBlocked = false }: { isBlocked?: boolean }) {
    // This component is strictly used to inject the hook into the layout
    useOnboardingTour(isBlocked);
    return null;
}
