import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, useGSAP)
gsap.defaults({ ease: 'power3.out', duration: 0.9 })

export const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// rabiscos usam pathLength="1" + traço não-escalável, então desenhamos via dashoffset
export const drawIn = (targets, vars = {}) =>
  gsap.fromTo(targets, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', ...vars })

export { gsap, ScrollTrigger, SplitText, useGSAP }
