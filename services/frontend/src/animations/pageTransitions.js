// Container avec stagger
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
      duration: 0.5,
    },
  },
}

// Items individuels (boutons, etc.)
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
    },
  },
}

// Logo 42
export const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.4 }
  },
}

// Favicon
export const faviconVariants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { 
    opacity: 1, 
    rotate: 0,
    transition: { duration: 0.6 }
  },
  exit: { 
    opacity: 0, 
    rotate: 180,
    transition: { duration: 0.6 }
  },
}