"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useStore } from "@/lib/store/useStore";

export function useOnboardingTour() {
    const { user, setSidebarCollapsed, setSidebarMobileOpen } = useStore();

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
    }, []);

    useEffect(() => {
        if (user) {
            const hasSeenTour = localStorage.getItem(`has_seen_tour_${user.id}`);
            if (!hasSeenTour) {
                // Give some time for the page to settle
                const timer = setTimeout(() => {
                    startTour();
                    localStorage.setItem(`has_seen_tour_${user.id}`, 'true');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, startTour]);

    return { startTour };
}

export function OnboardingTour() {
    // This component is strictly used to inject the hook into the layout
    useOnboardingTour();
    return null;
}
