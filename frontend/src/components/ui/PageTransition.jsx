import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.3
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
