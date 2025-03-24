
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  selectedItems: string[];
  onRemove: (item: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ selectedItems, onRemove }) => {
  if (selectedItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="sticky bottom-8 w-full max-w-md mx-auto glass-morphism rounded-xl p-4 shadow-lg z-10"
    >
      <div className="mb-3 pb-2 border-b">
        <h3 className="font-semibold">Your Order Summary</h3>
      </div>
      
      <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {selectedItems.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex justify-between items-center py-2 px-3 rounded-lg",
                "bg-background/50"
              )}
            >
              <span>{item}</span>
              <button
                onClick={() => onRemove(item)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${item} from order`}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      
      <div className="text-sm text-muted-foreground">
        {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
      </div>
    </motion.div>
  );
};

export default OrderSummary;
