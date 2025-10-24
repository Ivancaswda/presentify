'use client'
import {ConvexReactClient, ConvexProvider} from "convex/react";
import React, {ReactNode} from "react";


export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({children}: any) {
    return <ConvexProvider client={convex}>
            {children}
    </ConvexProvider>
}