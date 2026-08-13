/** Routes allowed for inactive (exited) employees with F&F access. */
export const EXIT_ONLY_ROUTES = ["/exit", "/documents", "/notifications"] as const;

export function isExitOnlyHref(href: string): boolean {
  return EXIT_ONLY_ROUTES.some(
    (route) => href === route || href.startsWith(`${route}/`)
  );
}

export function isInactiveEmployee(user: { isActive?: boolean | null } | null | undefined): boolean {
  return !!user && user.isActive === false;
}
