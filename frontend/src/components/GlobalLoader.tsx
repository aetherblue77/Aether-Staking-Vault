"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface GlobalLoaderProps {
    isLoading: boolean
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Use createPortal to render the loader outside (body)
    return createPortal(
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    {/* Animation Container */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-4 rounded-2xl bg-gray-900/90 p-8 shadow-2xl border border-white/10"
                    >
                        
                        {/* Spinner */}
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                        </div>

                        {/* Text Status */}
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">Processing Transaction...</h3>
                            <p className="text-sm text-gray-400">Please wait, do not close this window.</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body // Render directly to the body HTML
    )
}