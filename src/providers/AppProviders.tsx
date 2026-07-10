import type { PropsWithChildren } from "react";

import { HelmetProvider } from "./HelmetProvider";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <HelmetProvider>
            {children}
        </HelmetProvider>
    );
}