"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import styles from './HeroPhone3D.module.css';

type SceneKind = 'elite' | 'dermook';

/** Each example owns its scroll target and moves its phone and element independently. */
function PhoneScene({ kind }: { kind: SceneKind }) {
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isElite = kind === 'elite';
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [20, -12]);
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], isElite ? [7, -3] : [-7, 3]);
  const phoneRotateZ = useTransform(scrollYProgress, [0, 1], isElite ? [-1.5, .7] : [1.5, -.7]);
  const elementX = useTransform(scrollYProgress, [0, .65, 1], isElite ? ['14%', '0%', '-2%'] : ['-12%', '0%', '4%']);
  const elementY = useTransform(scrollYProgress, [0, .65, 1], isElite ? ['12%', '0%', '-2%'] : ['18%', '0%', '-8%']);
  const elementRotate = useTransform(scrollYProgress, [0, .65, 1], isElite ? [9, 0, -2] : [-12, -4, 2]);
  const elementScale = useTransform(scrollYProgress, [0, .65, 1], [.91, 1, 1.02]);
  const auraOpacity = useTransform(scrollYProgress, [0, .65, 1], [.55, 1, .8]);
  const name = isElite ? 'Elite Estates' : 'DERMOOK';
  const phoneAsset = isElite ? 'phone-elite-green' : 'phone-dermook-green';
  const elementAsset = isElite ? 'arrow-glass-green' : 'appointment-glass-green';
  const href = isElite ? '/test-mockup?demo=elite-estates' : '/test-mockup?demo=dermook&format=landing';

  return (
    <figure className={`${styles.scene} ${isElite ? styles.estate : styles.beauty}`} data-hero-device={kind}>
      <div className={styles.heading}>
        <p>{isElite ? 'Inmobiliarias' : 'Centros de estética'}</p>
        <span>{name}</span>
      </div>
      <div ref={stage} className={styles.stage} role="img" aria-label={isElite ? 'Elite Estates en un smartphone con botón verde en relieve y flecha de cristal animada al hacer scroll.' : 'DERMOOK en un smartphone con una tarjeta de calendario de cristal verde que flota al hacer scroll.'}>
        <motion.div className={styles.aura} aria-hidden="true" style={reducedMotion ? undefined : { opacity: auraOpacity }} />
        <motion.div className={styles.phone} data-hero-layer="phone" aria-hidden="true" style={reducedMotion ? undefined : { y: phoneY, rotateY: phoneRotateY, rotateZ: phoneRotateZ }}>
          <Image src={`/marketing/${phoneAsset}.webp`} alt="" width={1024} height={1536} sizes="(max-width: 640px) 40vw, (max-width: 1023px) 260px, 250px" priority />
        </motion.div>
        <motion.div className={isElite ? styles.arrow : styles.appointment} data-hero-layer="element" aria-hidden="true" style={reducedMotion ? undefined : { x: elementX, y: elementY, rotate: elementRotate, scale: elementScale }}>
          <Image src={`/marketing/${elementAsset}.webp`} alt="" width={isElite ? 1536 : 1024} height={1024} sizes={isElite ? '(max-width: 640px) 30vw, 200px' : '(max-width: 640px) 24vw, 155px'} priority />
        </motion.div>
        <div className={styles.floor} aria-hidden="true" />
      </div>
      <figcaption className={styles.caption}>
        <Link href={href} aria-label={`Explorar ${name} desde el teléfono 3D`}>Explorar diseño <span aria-hidden="true">↗</span></Link>
      </figcaption>
    </figure>
  );
}

export function HeroPhone3D() {
  return <div className={styles.duo} aria-label="Dos ejemplos de escaparates digitales"><PhoneScene kind="elite" /><PhoneScene kind="dermook" /></div>;
}
