
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  name: string;
  items: string[];
  timestamp: string;
}

const ThankYou = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try to get from localStorage for backwards compatibility
    const storedOrder = localStorage.getItem('neurotech-order');
    
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
      setLoading(false);
    } else {
      // If not in localStorage, try to fetch the most recent order
      fetchLatestOrder();
    }
  }, []);

  const fetchLatestOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching latest order:', error);
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        setOrderData(data[0] as OrderData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-300" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
          
          {loading ? (
            <div className="text-center p-6">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p>Loading your order details...</p>
            </div>
          ) : orderData ? (
            <div className="glass-morphism rounded-xl p-6 mt-8 text-left">
              <p className="text-lg mb-4">
                <span className="font-semibold">{orderData.name}</span>, your order has been received.
              </p>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Details:</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submitted on {formatDate(orderData.timestamp)}
                </p>
                
                <h3 className="font-medium mb-2">Selected Items:</h3>
                <ul className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-background/50 py-2 px-4 rounded-lg"
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your order has been recorded. Thank you for ordering with Neurotech.Africa!
              </p>
            </div>
          ) : (
            <p>No order information found. Please return to the main page to place an order.</p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link to="/">
              <Button variant="outline">
                Return to Menu
              </Button>
            </Link>
            <Link to="/orders">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ThankYou;
