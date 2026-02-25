"use client"

import { useEffect, useRef, useCallback } from "react"

interface Star {
    x: number
    y: number
    z: number
    originalX: number
    originalY: number
    size: number
    brightness: number
}

interface StarfieldProps {
    starCount?: number
    mouseSensitivity?: number
    starColor?: string
    backgroundColor?: string
    className?: string
}

export default function Starfield({
    starCount = 150,
    mouseSensitivity = 0.02,
    starColor = "#ffffff",
    backgroundColor = "#0a0a1a",
    className = ""
}: StarfieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const starsRef = useRef<Star[]>([])
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
    const animationRef = useRef<number>()
    const initializedRef = useRef(false)

    const initStars = useCallback((width: number, height: number) => {
        const stars: Star[] = []
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * width
            const y = Math.random() * height
            const z = Math.random() * 2 + 0.5 // Depth factor
            
            stars.push({
                x,
                y,
                z,
                originalX: x,
                originalY: y,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.5 + 0.5
            })
        }
        
        starsRef.current = stars
    }, [starCount])

    const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Clear canvas with background color
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        
        // Calculate mouse offset
        const mouseOffsetX = (mouseRef.current.targetX - width / 2) * mouseSensitivity
        const mouseOffsetY = (mouseRef.current.targetY - height / 2) * mouseSensitivity
        
        // Draw each star
        starsRef.current.forEach((star) => {
            // Calculate parallax offset based on depth
            const offsetX = mouseOffsetX * star.z
            const offsetY = mouseOffsetY * star.z
            
            // Apply offset to original position
            const drawX = star.originalX + offsetX
            const drawY = star.originalY + offsetY
            
            // Wrap stars around edges
            const wrappedX = ((drawX % width) + width) % width
            const wrappedY = ((drawY % height) + height) % height
            
            // Twinkle effect
            const twinkle = Math.sin(Date.now() * 0.003 + star.originalX * 0.01) * 0.2 + 0.8
            const alpha = star.brightness * twinkle
            
            // Draw star glow
            const gradient = ctx.createRadialGradient(
                wrappedX, wrappedY, 0,
                wrappedX, wrappedY, star.size * 2
            )
            gradient.addColorStop(0, starColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', ''))
            
            // Convert hex to rgba for gradient
            const hex = starColor.replace('#', '')
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`)
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            
            ctx.beginPath()
            ctx.arc(wrappedX, wrappedY, star.size * 2, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()
            
            // Draw star core
            ctx.beginPath()
            ctx.arc(wrappedX, wrappedY, star.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            ctx.fill()
        })
    }, [backgroundColor, mouseSensitivity, starColor])

    const animate = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        
        // Smooth mouse movement
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08
        
        drawStars(ctx, canvas.width, canvas.height)
        animationRef.current = requestAnimationFrame(animate)
    }, [drawStars])

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const parent = canvas.parentElement
        if (!parent) return
        
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        
        if (!initializedRef.current) {
            initStars(canvas.width, canvas.height)
            initializedRef.current = true
        }
    }, [initStars])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const rect = canvas.getBoundingClientRect()
        mouseRef.current.targetX = e.clientX - rect.left
        mouseRef.current.targetY = e.clientY - rect.top
    }, [])

    const handleMouseLeave = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        // Reset to center when mouse leaves
        mouseRef.current.targetX = canvas.width / 2
        mouseRef.current.targetY = canvas.height / 2
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        handleResize()
        window.addEventListener("resize", handleResize)
        
        // Start animation
        animationRef.current = requestAnimationFrame(animate)
        
        // Add mouse event listeners
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mouseleave", handleMouseLeave)
        
        return () => {
            window.removeEventListener("resize", handleResize)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            canvas.removeEventListener("mousemove", handleMouseMove)
            canvas.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [animate, handleResize, handleMouseMove, handleMouseLeave])

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${className}`}
            style={{ 
                background: backgroundColor,
                cursor: 'none'
            }}
        />
    )
}
