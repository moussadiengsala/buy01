//mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const Mypreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },
        typography: {
            fontFamily: "'Roboto'", // Specify your font family
            fontSize: {
                base: '16px',                 // Base font size
                lg: '18px',                   // Larger font size
                sm: '14px',                   // Smaller font size
                xl: '20px',                   // Extra large font size
            },
            fontWeight: {
                normal: '400',                // Normal font weight
                bold: '700',                  // Bold font weight
            },
            lineHeight: {
                normal: '1.5',                // Line height
                relaxed: '1.75',              // More relaxed line height
            },
        }
    },

});

