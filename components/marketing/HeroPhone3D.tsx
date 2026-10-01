"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import styles from './HeroPhone3D.module.css';

/** Two independent render layers; MotionValues keep scrolling off React's render path. */
export function HeroPhone3D() {
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stage,
    offset: ['start end', 'end start'],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [28, -16]);
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], [7, -3]);
  const phoneRotateZ = useTransform(scrollYProgress, [0, 1], [-1.5, .7]);
  const arrowX = useTransform(scrollYProgress, [0, .65, 1], ['14%', '0%', '-2%']);
  const arrowY = useTransform(scrollYProgress, [0, .65, 1], ['12%', '0%', '-2%']);
  const arrowRotate = useTransform(scrollYProgress, [0, .65, 1], [9, 0, -2]);
  const arrowScale = useTransform(scrollYProgress, [0, .65, 1], [.91, 1, 1.02]);
  const auraOpacity = useTransform(scrollYProgress, [0, .65, 1], [.55, 1, .8]);

  return (
    <figure className={styles.scene}>
      <div ref={stage} className={styles.stage} role="img" aria-label="Elite Estates en un smartphone con botón verde INNOVA en relieve y una flecha de cristal verde que se acerca al desplazarse por la página.">
        <motion.div className={styles.aura} aria-hidden="true" style={reducedMotion ? undefined : { opacity: auraOpacity }} />
        <motion.div className={styles.phone} aria-hidden="true" style={reducedMotion ? undefined : { y: phoneY, rotateY: phoneRotateY, rotateZ: phoneRotateZ }}>
          <Image src="/marketing/phone-elite-green.webp" alt="" width={1024} height={1536} sizes="(max-width: 640px) 60vw, (max-width: 1023px) 334px, 380px" priority />
        </motion.div>
        <motion.div className={styles.arrow} aria-hidden="true" style={reducedMotion ? undefined : { x: arrowX, y: arrowY, rotate: arrowRotate, scale: arrowScale }}>
          <Image src="/marketing/arrow-glass-green.webp" alt="" width={1536} height={1024} sizes="(max-width: 640px) 53vw, (max-width: 1023px) 281px, 320px" priority />
        </motion.div>
        <div className={styles.floor} aria-hidden="true" />
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.dot} aria-hidden="true" />
        <Link href="/test-mockup?demo=elite-estates">Elite Estates · Explorar este diseño <span aria-hidden="true">↗</span></Link>
      </figcaption>
    </figure>
  );
}
